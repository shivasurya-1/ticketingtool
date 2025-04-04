import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SearchIconRight from "../components/common/SearchRightIcon";
import ChatbotPopup from "../components/ChatBot";
import Button from "../components/common/Button";
import ReactPaginate from "react-paginate";

export default function Organisations() {
  const organisations = Array.from({ length: 100 }, (_, i) => ({
    number: `PR0000${i + 100}`,
    organizationName: `Company ${i + 1}`,
    OrganizationMail: `admin${i + 1}@company.com`,
  }));

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = Math.ceil(organisations.length / itemsPerPage);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationMail: "",
  });

  const [addOrganization, setAddOrganization] = useState(false);

  // Calculate items to display
  const offset = currentPage * itemsPerPage;
  const currentItems = organisations.slice(offset, offset + itemsPerPage);

  // Scroll to top when changing to the last page with fewer items
  useEffect(() => {
    if (currentPage === pageCount - 1 && currentItems.length < itemsPerPage) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  }, [currentPage, pageCount, currentItems.length]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const onClickAddOrganization = () => {
    setAddOrganization(true);
  };

  const handleAddOrganizationCancel = () => {
    setAddOrganization(false);
  };

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 mx-16">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-[39px] font-semibold">Organisations</h1>
            <p className="text-sm text-muted-foreground">
              Add, Search, and Manage your organizations all in one place
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <SearchIconRight placeholder="Search Organization" />
            <div className="flex gap-2">
              <Button label="Bulk Import" />
              <Button
                onClick={onClickAddOrganization}
                label="Add Organization"
                blueBackground
              />
            </div>
          </div>

          <div
            className={`${
              addOrganization
                ? "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                : "hidden"
            }`}
          >
            <div className="relative bg-white p-8 rounded-lg shadow-lg w-[45%]">
              <h1 className="text-lg font-semibold mb-4">Add Organization</h1>
              <hr className="absolute left-0 right-0 border-t border-gray-300" />
              <form className="space-y-6 pt-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="organizationName"
                    className="font-medium mb-4"
                  >
                    Organization Name
                  </label>
                  <input
                    id="organizationName"
                    name="organizationName"
                    required
                    className="border p-3 w-full rounded-md drop-shadow-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="organizationMail" className="font-medium">
                    Organization Mail
                  </label>
                  <p className="text-sm text-gray-500 mt-2 mb-2">
                    Enter organization mail separated by a space. For example,
                    “acme.com ajax.com”. Emails from these organization mail
                    will be added to the organization.
                  </p>
                  <input
                    id="organizationMail"
                    name="organization mail"
                    required
                    className="border p-3 w-full rounded-md drop-shadow-lg"
                  />
                </div>
                {/* Cancel and ADD Button */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleAddOrganizationCancel}
                    className="border p-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="border p-2 rounded-md bg-[#2E6EC0] text-white"
                  >
                    ADD
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-md border overflow-hidden mt-8">
            <table className="min-w-full table-fixed">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left font-medium">Number</th>
                  <th className="px-4 py-2 text-left font-medium">
                    Organization Name
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Organization Mail
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((organisation, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td className="px-4 py-2 break-words">
                      {organisation.number}
                    </td>
                    <td className="px-4 py-2 break-words">
                      {organisation.organizationName}
                    </td>
                    <td className="px-4 py-2 break-words">
                      {organisation.OrganizationMail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4">
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName="flex space-x-2"
              pageClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-300"
              activeClassName="bg-blue-500 text-white"
              previousClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-300"
              nextClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-300"
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
        </div>
      </main>
      <ChatbotPopup />
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { axiosInstance } from "../utils/axiosInstance";
// import { toast } from "react-toastify";
// import Sidebar from "../components/Sidebar";
// import SearchIconRight from "../components/common/SearchRightIcon";
// import ChatbotPopup from "../components/ChatBot";
// import Button from "../components/common/Button";
// import ReactPaginate from "react-paginate";

// export default function Organisations() {
//   const itemsPerPage = 14;
//   const [organisations, setOrganisations] = useState([]);
//   const [currentPage, setCurrentPage] = useState(0);
//   const pageCount = Math.ceil(organisations.length / itemsPerPage);

//   // Fetch organizations from API
//   useEffect(() => {
//     const fetchOrganisations = async () => {
//       const accessToken = localStorage.getItem("access_token");

//       if (!accessToken) {
//         toast.error("Access token is missing. Please login.");
//         return;
//       }

//       try {
//         const response = await axiosInstance.get("/org/organisation/", {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         });

//         setOrganisations(response.data); // Update state with fetched data
//         toast.success("Organizations fetched successfully");
//       } catch (error) {
//         console.error("Error Fetching Organizations:", error);
//         toast.error("There was an error fetching the organizations.");
//       }
//     };

//     fetchOrganisations();
//   }, []);

//   // Calculate items for current page
//   const offset = currentPage * itemsPerPage;
//   const currentItems = organisations.slice(offset, offset + itemsPerPage);

//   // Scroll to top when changing to last page with fewer items
//   useEffect(() => {
//     if (currentPage === pageCount - 1 && currentItems.length < itemsPerPage) {
//       setTimeout(() => {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//       }, 200);
//     }
//   }, [currentPage, pageCount, currentItems.length]);

//   // Handle page change
//   const handlePageClick = ({ selected }) => {
//     setCurrentPage(selected);
//   };

//   return (
//     <div className="flex w-full min-h-screen">
//       <Sidebar />
//       <main className="flex-1 mx-16">
//         <div className="p-6">
//           <div className="mb-6">
//             <h1 className="text-[39px] font-semibold">Organisations</h1>
//             <p className="text-sm text-muted-foreground">
//               Add, Search, and Manage your organizations all in one place
//             </p>
//           </div>

//           <div className="mb-6 flex items-center justify-between">
//             <SearchIconRight placeholder="Search Organization" />
//             <div className="flex gap-2">
//               <Button label="Bulk Import" />
//               <Button label="Add Organization" />
//             </div>
//           </div>

//           <div className="bg-white rounded-md border overflow-hidden mt-8">
//             <table className="min-w-full table-fixed">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="px-4 py-2 text-left font-medium">Number</th>
//                   <th className="px-4 py-2 text-left font-medium">
//                     Organization Name
//                   </th>
//                   <th className="px-4 py-2 text-left font-medium">
//                     Organization Mail
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.map((organisation, index) => (
//                   <tr
//                     key={index}
//                     className={`${
//                       index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                     } hover:bg-gray-100`}
//                   >
//                     <td className="px-4 py-2 break-words">
//                       {organisation.number}
//                     </td>
//                     <td className="px-4 py-2 break-words">
//                       {organisation.organizationName}
//                     </td>
//                     <td className="px-4 py-2 break-words">
//                       {organisation.OrganizationMail}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="flex justify-center mt-4">
//             <ReactPaginate
//               previousLabel={"← Previous"}
//               nextLabel={"Next →"}
//               breakLabel={"..."}
//               pageCount={pageCount}
//               marginPagesDisplayed={2}
//               pageRangeDisplayed={3}
//               onPageChange={handlePageClick}
//               containerClassName="flex space-x-2"
//               pageClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-300"
//               activeClassName="bg-blue-500 text-white"
//               previousClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-300"
//               nextClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-300"
//               disabledClassName="opacity-50 cursor-not-allowed"
//             />
//           </div>
//         </div>
//       </main>
//       <ChatbotPopup />
//     </div>
//   );
// }
