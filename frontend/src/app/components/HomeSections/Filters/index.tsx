import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
import { Search, X, ChevronDown, ChevronUp, Filter } from "lucide-react";

// Types
interface Filters {
     search: string;
     professional: string[];
     experience: string[];
     company: string;
     sort: string;
     //   hourRate: [number, number];
     // readiness: string[];
}

interface LeftSidebarProps {
     filters: Filters;
     setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

interface CollapsedSections {
     [key: string]: boolean;
}

// interface SortOption {
//      value: string;
//      label: string;
// }

// interface ExperienceLevel {
//      value: string;
//      label: string;
// }

// interface AvailabilityStatus {
//      value: string;
//      label: string;
//      color: string;
// }

interface CollapsibleSectionProps {
     title: string;
     children: React.ReactNode;
     sectionKey: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ filters, setFilters }) => {
     const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>({});
     // const [hourRate, setHourRate] = useState<[number, number]>([8, 39]);

     const toggleFilter = (
          category: keyof Pick<Filters, "professional" | "experience" >,
          value: string
     ): void => {
          setFilters((prev) => {
               const currentValues = prev[category] as string[];
               const updated = currentValues.includes(value)
                    ? currentValues.filter((v) => v !== value)
                    : [...currentValues, value];
               return { ...prev, [category]: updated };
          });
     };

     const handleSearchCompany = (e: React.ChangeEvent<HTMLInputElement>): void => {
          setFilters((prev) => ({ ...prev, company: e.target.value }));
     };

     const handleSortChange = (value: string): void => {
          setFilters((prev) => ({ ...prev, sort: value }));
     };

     //   const handleHourRateChange = (value: [number, number]): void => {
     //     setHourRate(value);
     //     setFilters((prev) => ({ ...prev, hourRate: value }));
     //   };

     const handleReset = (): void => {
          const resetFilters: Filters = {
               search: "",
               professional: [],
               experience: [],
               company: "",
               sort: "most-experienced",

               // readiness: [],
          };
          setFilters(resetFilters);
          // setHourRate([8, 39]);
     };

     const toggleSection = (section: string): void => {
          setCollapsedSections((prev) => ({
               ...prev,
               [section]: !prev[section],
          }));
     };

     const getActiveFiltersCount = (): number => {
          let count = 0;
          if (filters.company) count++;
          if (filters.professional?.length) count += filters.professional.length;
          if (filters.experience?.length) count += filters.experience.length;
          // if (filters.readiness?.length) count += filters.readiness.length;
          return count;
     };

     const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, sectionKey }) => (
          <div className="border-b border-gray-700 pb-4 cursor-pointer">
               <button
                    onClick={() => toggleSection(sectionKey)}
                    className="flex items-center justify-between w-full mb-3 text-left hover:text-purple-300 transition-colors"
               >
                    <h3 className="font-medium text-sm uppercase tracking-wide">{title}</h3>
                    {collapsedSections[sectionKey] ? (
                         <ChevronDown className="w-4 h-4" />
                    ) : (
                         <ChevronUp className="w-4 h-4" />
                    )}
               </button>
               {!collapsedSections[sectionKey] && <div className="space-y-3">{children}</div>}
          </div>
     );

     return (
          <div className="w-72 sticky top-18 h-[calc(100vh-72px)] overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950 text-white border-r border-gray-700 flex flex-col custom-scrollbar">
               {/* Header */}
               <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                              <Filter className="w-5 h-5 text-[#21cab9]" />
                              <h2 className="text-lg font-semibold">Filters</h2>
                              {getActiveFiltersCount() > 0 && (
                                   <span className="bg-[#21cab9] text-white text-xs px-2 py-1 rounded-full">
                                        {getActiveFiltersCount()}
                                   </span>
                              )}
                         </div>
                         <Button
                              onClick={handleReset}
                              variant="ghost"
                              size="sm"
                              className="text-[#21cab9] cursor-pointer hover:text-white bg-purple-[#21cab9] hover:bg-[#21cab9] text-xs"
                         >
                              {/* <X className="w-3 h-3 mr-1" /> */}
                              Reset All
                         </Button>
                    </div>
               </div>

               {/* Scrollable content */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Company Search */}
                    <CollapsibleSection title="Company" sectionKey="company">
                         <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                   className="w-full pl-10 pr-4 py-3 rounded-lg text-sm bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-[#21cab9] focus:ring-2 focus:ring-[#21cab9] focus:outline-none transition-all"
                                   placeholder="Search company name..."
                                   value={filters.company}
                                   onChange={handleSearchCompany}
                              />
                              {filters.company && (
                                   <button
                                        onClick={() => setFilters((prev) => ({ ...prev, company: "" }))}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                   >
                                        <X className="w-4 h-4" />
                                   </button>
                              )}
                         </div>
                    </CollapsibleSection>

                    {/* ____Commenting this for now we will add this later____ */}

                    {/* Availability */}
                    {/* <CollapsibleSection title="Availability" sectionKey="readiness">
                         <div className="space-y-3">
                              {[
                                   { value: "available", label: "Available Now", color: "text-green-400" },
                                   { value: "busy", label: "Busy", color: "text-yellow-400" },
                                   { value: "hired", label: "Currently Hired", color: "text-red-400" },
                              ].map((status) => (
                                   <div key={status.value} className="flex items-center space-x-3">
                                        <Checkbox
                                             id={status.value}
                                             checked={filters.readiness?.includes(status.value)}
                                             onCheckedChange={() => toggleFilter("readiness", status.value)}
                                             className="border-purple-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                        <Label
                                             htmlFor={status.value}
                                             className={`text-sm cursor-pointer hover:text-purple-300 ${status.color}`}
                                        >
                                             {status.label}
                                        </Label>
                                   </div>
                              ))}
                         </div>
                    </CollapsibleSection> */}

                    {/* Sort By */}
                    <CollapsibleSection title="Sort By" sectionKey="sort">
                         <RadioGroup value={filters.sort} onValueChange={handleSortChange} className=" space-y-1">
                              {[
                                   { value: "most-experienced", label: "Most Experienced" },
                                   { value: "least-experienced", label: "Least Experienced" },
                                   { value: "recent-added-profile", label: "Newly Added Profile" },
                              ].map((option) => (
                                   <div key={option.value} className="flex items-center space-x-3">
                                        <RadioGroupItem
                                             value={option.value}
                                             id={option.value}
                                             className="border-[#21cab9] text-[#21cab9] data-[state=checked]:border-[#21cab9] data-[state=checked]:bg-[#21cab9]"
                                        />
                                        <Label
                                             htmlFor={option.value}
                                             className="text-sm cursor-pointer hover:text-[#21cab9]"
                                        >
                                             {option.label}
                                        </Label>
                                   </div>
                              ))}
                         </RadioGroup>
                    </CollapsibleSection>

                    {/* Professional Roles */}
                    {/* <CollapsibleSection title="Professional Role" sectionKey="professional">
          <div className="grid grid-cols-1 gap-3">
            {[
              "Frontend Developer",
              "Backend Developer", 
              "Full Stack Developer",
              "DevOps Engineer",
              "Python Developer",
              "Mobile Developer",
              "Data Scientist",
              "UI/UX Designer"
            ].map((role) => (
              <div key={role} className="flex items-center space-x-3">
                <Checkbox
                  id={role}
                  checked={filters.professional?.includes(role)}
                  onCheckedChange={() => toggleFilter("professional", role)}
                  className="border-purple-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <Label htmlFor={role} className="text-sm cursor-pointer hover:text-purple-300 flex-1">
                  {role}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleSection> */}

                    {/* Hour Rate */}
                    {/* <CollapsibleSection title="Hourly Rate" sectionKey="hourRate">
          <div className="space-y-4">
            <Slider
              value={hourRate}
              onValueChange={handleHourRateChange}
              max={100}
              min={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span className="bg-gray-800 px-2 py-1 rounded">${hourRate[0]}</span>
              <span className="bg-gray-800 px-2 py-1 rounded">${hourRate[1]}</span>
            </div>
          </div>
        </CollapsibleSection> */}

                    {/* Experience */}
                    <CollapsibleSection title="Experience Level" sectionKey="experience">
                         <div className="space-y-4">
                              {[
                                   { value: "0-1", label: "Entry Level (0-1 years)" },
                                   { value: "1-3", label: "Junior (1-3 years)" },
                                   { value: "4-8", label: "Mid-level (4-8 years)" },
                                   { value: "9-14", label: "Senior (9-14 years)" },
                                   { value: "15+", label: "Expert (15+ years)" },
                              ].map((exp) => (
                                   <div key={exp.value} className="flex items-center space-x-3">
                                        <Checkbox
                                             id={exp.value}
                                             checked={filters.experience?.includes(exp.value)}
                                             onCheckedChange={() => toggleFilter("experience", exp.value)}
                                             className="border-[#21cab9] data-[state=checked]:bg-[#21cab9] data-[state=checked]:border-[#21cab9]"
                                        />
                                        <Label htmlFor={exp.value} className="text-sm cursor-pointer hover:text-[#21cab9]">
                                             {exp.label}
                                        </Label>
                                   </div>
                              ))}
                         </div>
                    </CollapsibleSection>
               </div>

               {/* Footer */}
               {/* <div className="p-6 border-t border-gray-700">
                    <Button
                         onClick={handleReset}
                         className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
                    >
                         Clear All Filters
                    </Button>
               </div> */}
          </div>
     );
};

export default LeftSidebar;
