"use client";
import { axiosInstance } from "../utils/axiosInstance";
import { ChevronsUp, Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatbotPopup from "../components/ChatBot";

export default function AssignedMe() {
  const problems = Array.from({ length: 8 }, (_, i) => ({
    number: "PR0001/155",
    problemStatement: "Unable to connect to Wi-Fi",
    state: "New",
    resolutionCode: "",
    assignmentGroup: "Problem Solving",
    assignedTo: "Conductor A",
    configurationItem: "Wireless",
  }));

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1  mx-16 ">
        <div className="  p-6  ">
          <div>
            <h1 className=" text-3xl font-bold">Assigned to me</h1>
          </div>

          <div>
            <ul className=" flex gap-6 items-center font-medium pt-5">
              <li>Problems</li>
              <li>New</li>
              <li>Search</li>
              <div className="relative ">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-3 rounded-xl border  w-[192px]  focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>{" "}
            </ul>
          </div>

          <div className=" bg-white p-4 px-7 my-10 rounded-xl">
            <h1 className=" font-bold text-xl my-5 ">Solution</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
              placerat quis massa et volutpat. Vestibulum sed faucibus lorem.
              Vivamus euismod neque non tortor aliquam, vitae ullamcorper lectus
              facilisis. Nulla eget ex et neque ullamcorper semper in vitae
              felis. Sed sagittis metus nec eros tincidunt, eu consectetur magna
              aliquet. Cras maximus porta mi id vehicula. Nam non feugiat sem.
              Nulla ut faucibus quam.
            </p>

            <div className="rounded-md border overflow-hidden mt-8">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left font-medium">Number</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Problem Statement
                    </th>
                    <th className="px-4 py-2 text-left font-medium">State</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Resolution Code
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Assignment Group
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Assigned to
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Configuration Item
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-2">{problem.number}</td>
                      <td className="px-4 py-2">{problem.problemStatement}</td>
                      <td className="px-4 py-2">{problem.state}</td>
                      <td className="px-4 py-2">{problem.resolutionCode}</td>
                      <td className="px-4 py-2">{problem.assignmentGroup}</td>
                      <td className="px-4 py-2">{problem.assignedTo}</td>
                      <td className="px-4 py-2">{problem.configurationItem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <ChatbotPopup />
    </div>
  );
}
