import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
     // Create Skills
     const jsSkill = await prisma.skill.upsert({
          where: { name: "JavaScript" },
          update: {},
          create: {
               name: "JavaScript",
               category: "Web Development",
          },
     });

     const reactSkill = await prisma.skill.upsert({
          where: { name: "React" },
          update: {},
          create: {
               name: "React",
               category: "Frontend",
          },
     });

     // Create Users
     const mentor = await prisma.user.upsert({
          where: { email: "alice@example.com" },
          update: {},
          create: {
               name: "Alice Mentor",
               email: "alice@example.com",
               password: "hashedpassword1", // Use hashed version in real app
               bio: "Experienced frontend developer",
               avatarUrl: "https://i.pravatar.cc/150?u=alice",
               skillsOffered: {
                    connect: [{ id: jsSkill.id }, { id: reactSkill.id }],
               },
          },
     });

     const learner = await prisma.user.upsert({
          where: { email: "bob@example.com" },
          update: {},
          create: {
               name: "Bob Learner",
               email: "bob@example.com",
               password: "hashedpassword2",
               bio: "Looking to learn React",
               avatarUrl: "https://i.pravatar.cc/150?u=bob",
               skillsWanted: {
                    connect: [{ id: reactSkill.id }],
               },
          },
     });

     // Create a session between Alice (mentor) and Bob (learner)
     // For sessions/posts, we might just create them if they don't exist, or just append. 
     // To avoid duplicates on re-runs, we can verify if they exist or just wrap in try-catch or leave as create (which might fail if unique constraints exist, but posts usually don't have unique titles).
     // However, repeated runs will create duplicate posts. Ideally we should check.
     
     // Simple check for posts to avoid duplicates
     const existingPost = await prisma.post.findFirst({ where: { title: "Why React Hooks are amazing?" } });
     if (!existingPost) {
         const post1 = await prisma.post.create({
              data: {
                   title: "Why React Hooks are amazing?",
                   content: "React hooks allow you to use state and other React features without writing a class. It's a game changer!",
                   authorId: mentor.id,
                   skillId: reactSkill.id,
              }
         });
         
         // Add votes only if post created
          await prisma.vote.create({
               data: {
                    value: 1,
                    userId: learner.id,
                    postId: post1.id,
               }
          });
     }

     const existingPost2 = await prisma.post.findFirst({ where: { title: "Understanding JavaScript Closures" } });
     if (!existingPost2) {
         const post2 = await prisma.post.create({
              data: {
                   title: "Understanding JavaScript Closures",
                   content: "Closures are a fundamental concept in JavaScript. They allow a function to access variables from an enclosing scope even after it has finished executing.",
                   authorId: mentor.id, 
                   skillId: jsSkill.id,
              }
         });
         
          // Add some comments
          await prisma.comment.create({
               data: {
                    content: "Great explanation! Closures were confusing for me too.",
                    authorId: learner.id,
                    postId: post2.id,
               }
          });
     }

     const existingPost3 = await prisma.post.findFirst({ where: { title: "Help with React useEffect" } });
     if (!existingPost3) {
         const post3 = await prisma.post.create({
              data: {
                   title: "Help with React useEffect",
                   content: "I'm struggling to understand the dependency array in useEffect. Can someone explain?",
                   authorId: learner.id,
                   skillId: reactSkill.id,
              }
         });
         
          await prisma.comment.create({
               data: {
                    content: "The dependency array determines when the effect should re-run. If it's empty, it runs only once on mount.",
                    authorId: mentor.id,
                    postId: post3.id,
               }
          });
     }


     console.log("✅ Seed data inserted successfully!");
}

main()
     .catch((e) => {
          console.error("❌ Error while seeding:", e);
          process.exit(1);
     })
     .finally(async () => {
          await prisma.$disconnect();
     });
