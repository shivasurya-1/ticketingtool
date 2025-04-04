import { ChevronsUp, Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatbotPopup from "../components/ChatBot";
import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axiosInstance";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Define the steps structure for empty state
const defaultSteps = [
    {
        title: "STEP 1",
        items: ["No solution step details available"],
    },
];

export default function Details() {
    const [value, setValue] = useState(null); // Changed to null for clarity
    const [sla, setSla] = useState(null);
    const [status, setStatus] = useState("Resolved");
    const [ticketId, setTicketId] = useState("");
    const [solutionInput, setSolutionInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSolution, setHasSolution] = useState(false);
    const [solutionSteps, setSolutionSteps] = useState(defaultSteps);
    const [availableSolutions, setAvailableSolutions] = useState([]);
    const [selectedSolution, setSelectedSolution] = useState(null);

    const navigate = useNavigate();

    // Extract ticket ID from URL
    useEffect(() => {
        const pathname = window.location.pathname;
        const id = pathname.split("/").pop();
        setTicketId(id);
    }, []);

    const statuses = [
        "Open",
        "Working in progress",
        "Waiting for users",
        "Resolved",
        "Closed",
        "Cancelled",
    ];

    const getStatusBackgroundColor = (currentStatus, index) => {
        const currentIndex = statuses.indexOf(currentStatus);
        if (index <= currentIndex) {
            return "bg-[#0E68C8] text-white";
        }
        return "bg-transparent text-[#0E68C8]";
    };

    // Fetch ticket and SLA data
    useEffect(() => {
        const fetchIncidents = async () => {
            if (!ticketId) return;

            try {
                const token = localStorage.getItem("access_token");
                const ticketResponse = await axiosInstance.get(`/ticket/${ticketId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Fetch available solutions
                const availableSolutionsResponse = await axiosInstance.get(`solution/solutions/${ticketId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Set available solutions and handle if there are any
                const solutions = availableSolutionsResponse.data || [];
                setAvailableSolutions(solutions);
                
                if (solutions.length > 0) {
                    setHasSolution(true);
                    setSelectedSolution(solutions[0]); // Select first solution by default
                }

                setValue(ticketResponse.data); // Set full ticket data

                const slaResponse = await axiosInstance.get(`/sla/${ticketId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSla(slaResponse.data.sla_timer);

                if (ticketResponse.data?.solution) {
                    setHasSolution(true);
                    setSolutionInput(ticketResponse.data.solution); // Pre-fill solution if it exists
                }

                if (ticketResponse.data?.solutionSteps && ticketResponse.data.solutionSteps.length > 0) {
                    setSolutionSteps(ticketResponse.data.solutionSteps);
                }

                console.log("Ticket Data:", ticketResponse.data);
                console.log("Available Solutions:", solutions);
            } catch (error) {
                console.error("Error fetching incidents:", error);
            }
        };

        if (ticketId) {
            fetchIncidents();
        }
    }, [ticketId]);

    const handleSolutionSubmit = async () => {
        if (!solutionInput.trim()) {
            alert("Please enter a solution");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("access_token");
            const solutionData = {
                ticket: ticketId,
                solution_text: solutionInput,
                user: value?.assignee || 2,
                created_by: value?.created_by || 2,
                updated_by: value?.assignee || 2,
                org_group: 1,
            };

            const response = await axiosInstance.post("/solution/create/", solutionData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Refetch available solutions to update the list
            const availableSolutionsResponse = await axiosInstance.get(`solution/solutions/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const solutions = availableSolutionsResponse.data || [];
            setAvailableSolutions(solutions);
            
            if (solutions.length > 0) {
                setHasSolution(true);
                setSelectedSolution(response.data || solutions[0]); // Select the newly created solution
            }

            // Refetch ticket data to ensure consistency
            const updatedTicketResponse = await axiosInstance.get(`/ticket/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setValue(updatedTicketResponse.data); // Update with full ticket data
            setSolutionInput(""); // Clear input after submission
            alert("Solution submitted successfully!");
        } catch (error) {
            console.error("Error submitting solution:", error);
            alert("Failed to submit solution. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectSolution = (solution) => {
        setSelectedSolution(solution);
    };

    // Format date to a readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="flex w-full min-h-screen">
            <Sidebar />
            <main className="flex-1 mx-16">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="w-full">
                            <h1 className="text-[39px] font-semibold">DETAILS</h1>
                            <div className="flex justify-between w-full items-center">
                                <div className="flex items-center gap-6">
                                    <h1 className="text-[24px] font-normal">{value?.summary}</h1>
                                    <p className="flex text-xl items-center text-[#F24E1E] font-bold">
                                        <ChevronsUp className="h-8 w-8" /> {value?.impact}
                                    </p>
                                </div>
                                <div className="relative bg-[#FFCC7B] rounded-full p-2 px-6">
                                    <h1 className="font-bold">{value?.status}</h1>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="pl-10 pr-4 py-3 rounded-full border w-[192px] border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="flex mt-2">
                                <ul className="flex gap-8 text-gray-500 text-sm">
                                    <li>Home</li>
                                    <li>List of Incident</li>
                                    <li>Details</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white text-[#0E68C8] rounded-xl font-semibold">
                        <ul className="flex justify-between items-center bg">
                            {statuses.map((stat, index) => (
                                <li
                                    key={index}
                                    className={`px-4 py-2 rounded-md ${getStatusBackgroundColor(value?.status || status, index)}`}
                                >
                                    {stat}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex">
                        <div>
                            <div className="flex gap-4">
                                <div className="bg-white mt-8 w-64 font-bold p-4 rounded-xl shadow-lg">
                                    <div className="flex justify-between items-center px-3 mb-1">
                                        <p className="text-black">SLA:</p>
                                        <p className="text-lg text-black font-semibold">{sla?.sla_status}</p>
                                    </div>
                                    <p className="text-[#293988] px-4 text-sm font-medium">Time for Resolution: 10 hrs</p>
                                </div>
                                <div className="bg-white mt-8 w-64 font-bold p-4 rounded-xl shadow-lg">
                                    <div className="flex justify-between items-center px-3 mb-1">
                                        <p className="text-black">People</p>
                                    </div>
                                    <p className="text-[#293988] px-4 text-sm font-medium">Assignee: {value?.assignee || "ABC"}</p>
                                </div>
                                <div className="bg-white mt-8 w-64 font-bold p-4 rounded-xl shadow-lg">
                                    <div className="flex justify-between items-center px-3 mb-1">
                                        <p className="text-black">Service Project Request</p>
                                    </div>
                                    <p className="text-[#293988] px-2 text-sm font-medium">
                                        Time for Resolution: <span className="text-red-400">No Match</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-9 bg-white p-10 max-w-4xl rounded-xl">
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">{value?.summary}</h1>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <p className="font-medium">ID:</p>
                                        <p>{value?.ticket_id}</p>
                                    </div>
                                </div>
                                <p className="font-medium mb-3 mt-6">Description</p>
                                <div className="max-h-80 overflow-auto">
                                    <p>{value?.description}</p>
                                    <div className="flex gap-8 mt-8 mb-8">
                                        {value?.attachments && value.attachments.length > 0 ? (
                                            value.attachments.map((attachment, index) => (
                                                <div key={index} className="w-[200px] min-h-[163px] bg-[#D9D9D9] p-4 rounded-xl"></div>
                                            ))
                                        ) : (
                                            <>
                                                <div className="w-[200px] min-h-[163px] bg-[#D9D9D9] p-4 rounded-xl"></div>
                                                <div className="w-[200px] min-h-[163px] bg-[#D9D9D9] p-4 rounded-xl"></div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col items-center w-full">
                            <h1 className="text-xl font-semibold">Timeline</h1>
                            <hr className="w-1/2 border-t-2 border-gray-500 mt-2" />
                            <div className="flex items-center justify-start mt-12 w-full">
                                <div className="relative w-2 bg-[#306EBF] h-[500px] mx-auto">
                                    <div className="absolute left-[40px] top-[10px] text-sm text-[#293988] font-bold">Updated</div>
                                    <div className="absolute left-[40px] top-[80px] text-sm text-[#293988] font-bold">Updated</div>
                                    <div className="absolute left-[40px] top-[150px] text-sm text-[#293988] font-bold">Updated</div>
                                    <div className="absolute left-[40px] top-[220px] text-sm text-[#293988] font-bold">Updated</div>
                                    <div className="absolute left-[40px] top-[290px] text-sm text-[#293988] font-bold">Updated</div>
                                    <div className="absolute left-[40px] top-[360px] text-sm text-[#293988] font-bold">Updated</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 w-[90%]">
                        <h1 className="font-bold text-xl my-5">ISSUE</h1>
                        <p>
                            {value?.issue ||
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam placerat quis massa et volutpat. Vestibulum sed faucibus lorem. Vivamus euismod neque non tortor aliquam, vitae ullamcorper lectus facilisis."}
                        </p>
                    </div>

                    <div className="bg-white p-4 px-7 my-10 rounded-xl">
                        <h1 className="font-bold text-xl my-5">Solution</h1>

                        {availableSolutions.length > 0 ? (
                            <div>
                                {availableSolutions.length > 1 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Available Solutions ({availableSolutions.length})</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {availableSolutions.map((solution, index) => (
                                                <button
                                                    key={solution.solution_id}
                                                    onClick={() => handleSelectSolution(solution)}
                                                    className={`px-4 py-2 rounded-lg ${
                                                        selectedSolution && selectedSolution.solution_id === solution.solution_id
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-100 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    Solution #{index + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedSolution && (
                                    <div className="border p-4 rounded-lg">
                                        <div className="flex justify-between mb-3">
                                            <span className="text-sm text-gray-500">Solution ID: {selectedSolution.solution_id}</span>
                                            <span className="text-sm text-gray-500">Created: {formatDate(selectedSolution.created_at)}</span>
                                        </div>
                                        <p className="mb-4">{selectedSolution.solution_text}</p>
                                        
                                        {/* Solution steps visualization */}
                                        <div className="relative w-full pt-16">
                                            <div className="absolute top-6 left-0 right-0 h-[4px] bg-gray-200" />
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                                {solutionSteps.map((step, index) => (
                                                    <div key={index} className="space-y-4">
                                                        <h3 className="bg-white pr-4 inline-block relative z-10 text-lg font-bold">{step.title}</h3>
                                                        <ul className="space-y-3 text-sm text-muted-foreground font-medium">
                                                            {step.items.map((item, itemIndex) => (
                                                                <li key={itemIndex} className="flex items-start">
                                                                    <span className="mr-2">•</span>
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-500 italic">No solution has been provided for this ticket yet.</p>
                                {value?.status !== "Resolved" && value?.status !== "Closed" && (
                                    <div className="mt-4">
                                        <textarea
                                            value={solutionInput}
                                            onChange={(e) => setSolutionInput(e.target.value)}
                                            placeholder="Enter solution here..."
                                            className="w-full p-2 border rounded-md mb-2"
                                            rows="4"
                                        />
                                        <button
                                            onClick={handleSolutionSubmit}
                                            disabled={isSubmitting}
                                            className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
                                                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                                            }`}
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Solution"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Add new solution button when there are already solutions */}
                        {availableSolutions.length > 0 && value?.status !== "Resolved" && value?.status !== "Closed" && (
                            <div className="mt-6">
                                <details className="border rounded-md p-3">
                                    <summary className="font-medium cursor-pointer">Add Another Solution</summary>
                                    <div className="mt-3">
                                        <textarea
                                            value={solutionInput}
                                            onChange={(e) => setSolutionInput(e.target.value)}
                                            placeholder="Enter new solution here..."
                                            className="w-full p-2 border rounded-md mb-2"
                                            rows="4"
                                        />
                                        <button
                                            onClick={handleSolutionSubmit}
                                            disabled={isSubmitting}
                                            className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
                                                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                                            }`}
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Solution"}
                                        </button>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <ChatbotPopup />
        </div>
    );
}