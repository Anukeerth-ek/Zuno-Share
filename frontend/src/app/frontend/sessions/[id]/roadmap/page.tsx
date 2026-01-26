"use client";

import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
     MiniMap,
     Controls,
     Background,
     addEdge,
     useNodesState,
     useEdgesState,
     Connection,
     Edge,
     ReactFlowInstance,
     Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { getBaseUrl } from "@/utils/getBaseUrl";

interface Session {
     id: string;
     mentor: { name: string };
     learner: { name: string };
     skill: { name: string };
     status: "PENDING" | "CONFIRMED" | "REJECTED";
     scheduledAt: string;
     meetLink?: string;
}

export default function RoadmapPage() {
     const [nodes, setNodes, onNodesChange] = useNodesState([]); // empty
     const [edges, setEdges, onEdgesChange] = useEdgesState([]);
     const [nodeId, setNodeId] = useState(1);
     const [session, setSession] = useState<Session | null>(null);
     const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
     const [token, setToken] = useState<string | null>(null);

     
     const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

     const updateNodeLabel = (id: string, label: string) => {
          setNodes((nds) =>
               nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label, onChange: updateNodeLabel } } : n))
          );
     };

     const addNewNode = () => {
          setNodes((nds) => {
               const lastNode = nds[nds.length - 1]; // get last node if exists
               const newId = `${nodeId}`;

               const newNode = {
                    id: newId,
                    type: "editable",
                    position: lastNode
                         ? { x: lastNode.position.x, y: lastNode.position.y + 120 } // 👈 place below last node
                         : { x: 0, y: 0 }, // first node at (0,0)
                    data: { label: `Step ${nodeId}`, onChange: updateNodeLabel },
               };

               return [...nds, newNode];
          });

          // add edge to previous node
          if (nodeId > 1) {
               const newEdgeId = `e${nodeId - 1}-${nodeId}-${Date.now()}`;
               setEdges((eds) => [
                    ...eds,
                    {
                         id: newEdgeId,
                         source: `${nodeId - 1}`,
                         target: `${nodeId}`,
                    },
               ]);
          }

          setNodeId((id) => id + 1);
     };

     useEffect(() => {
          const stored = localStorage.getItem("token");
          setToken(stored);
     }, []);

     useEffect(() => {
          const saved = localStorage.getItem("selectedSession");

          if (saved && token) {
               const sessionData = JSON.parse(saved);
               setSession(sessionData);

               // fetch roadmap from backend
               const BASE_URL = getBaseUrl();
               fetch(`${BASE_URL}/api/sessions/${sessionData.id}/roadmap`, {
                    headers: {
                         authorization: `Bearer ${token}`,
                    },
               })
                    .then((res) => res.json())
                    .then((data) => {
                         if (data?.nodes) {
                              setNodes(data.nodes || []);
                              setEdges(data.edges || []);
                              const maxId =
                                   data.nodes && data.nodes.length > 0
                                        ? Math.max(...data.nodes.map((n: Node) => parseInt(n.id)))
                                        : 0;
                              setNodeId(maxId + 1);
                              if (reactFlowInstance) {
                                   reactFlowInstance.setViewport(data.viewport || { x: 0, y: 0, zoom: 1 });
                              }
                         }
                    });
          }
     }, [reactFlowInstance, token, setEdges, setNodes]);

	const handleSave = async () => {
		if (!reactFlowInstance || !session) return;

		const flow = reactFlowInstance.toObject(); // { nodes, edges, viewport }
		const BASE_URL = getBaseUrl();

		await fetch(`${BASE_URL}/api/sessions/${session.id}/roadmap`, {
			method: "POST",
               headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
               body: JSON.stringify({ roadmap: flow }),
          });

          alert("Roadmap saved ✅");
     };

     return (
          <div style={{ display: "flex", width: "100%", height: "100vh" }}>
               {/* Sidebar (10% width) */}
               <div
                    style={{
                         width: "10%",
                         background: "#f9fafb",
                         padding: "12px",
                         borderRight: "1px solid #ddd",
                         display: "flex",
                         flexDirection: "column",
                         gap: "12px",
                    }}
               >
                    <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "bold" }}>Controls</h3>
                    <Button
                         variant="default"
                         onClick={addNewNode}
                         style={{
                              padding: "8px 12px",
                              background: "#2563eb",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                         }}
                    >
                         ➕ Add Node
                    </Button>

                    <Button variant="default" onClick={handleSave}>
                         Save Changes
                    </Button>
               </div>

               {/* React Flow Canvas (90% width) */}
               <div style={{ width: "90%", height: "100%" }}>
                    <ReactFlow
                         nodes={nodes}
                         edges={edges}
                         onNodesChange={onNodesChange}
                         onEdgesChange={onEdgesChange}
                         onConnect={onConnect}
                         fitView
                         zoomOnScroll={false}
                         preventScrolling={false}
                         onInit={setReactFlowInstance}
                    >
                         <MiniMap />
                         <Controls />
                         <Background gap={16} color="#aaa" />
                    </ReactFlow>
               </div>
          </div>
     );
}
