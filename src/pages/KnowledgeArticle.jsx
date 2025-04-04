"use client"

import { ChevronsUp, Search } from "lucide-react"
import Sidebar from "../components/Sidebar"
import ChatbotPopup from "../components/ChatBot"


export default function KnowledgeArticle() {
    return (
        <div className="flex w-full min-h-screen">
            <Sidebar />
            <main className="flex-1  mx-16 ">
                <div className="  p-6  ">

                    <div className="mb-6 flex items-center justify-between">

                        <div className=" w-full">
                            <h1 className="text-[39px] font-semibold">Knowledge Article</h1>
                            <div className=" flex justify-between w-full items-center">
                                <div className=" flex items-center gap-6">
                                    <h1 className="text-[24px] font-normal">Return Sales Order BOM Item  </h1>
                                    <p className=" flex text-xl items-center text-[#F24E1E] font-bold"> <ChevronsUp className=" h-8 w-8" /> Major</p>
                                </div>
                                <div className="relative bg-[#C3E593] rounded-full p-2 px-6 ">
                                    <h1 className=" font-bold ">
                                        Resolved
                                    </h1>
                                </div>
                                <div className="relative ">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="pl-10 pr-4 py-3 rounded-full border  w-[192px] border-gray-600  focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>


                            <div className=" flex mt-2">
                                <ul className=" flex gap-8 text-gray-500 text-sm">
                                    <li>Home </li>
                                    <li>List of Incident</li>
                                    <li>Details</li>
                                </ul>
                            </div>
                            <div className=" flex  ">
                                <div >
                                    <div className=" flex gap-4">

                                        <div className="bg-white mt-8 w-64 font-bold p-4 rounded-xl shadow-lg">
                                            <div className="flex justify-between items-center px-3 mb-1">
                                                <p className=" text-black">SLA:</p>
                                                <p className="text-lg font-semibold ]">11:00</p>
                                            </div>

                                            <p className="text-[#293988] px-4 text-sm font-medium">
                                                Time for Resolution: 10 hrs
                                            </p>
                                        </div>
                                        <div className="bg-white mt-8 w-64 font-bold p-4 rounded-xl shadow-lg">
                                            <div className="flex justify-between items-center px-3 mb-1">
                                                <p className=" text-black">People</p>
                                            </div>

                                            <p className="text-[#293988] px-4 text-sm font-medium">
                                                Assignee: ABC
                                            </p>
                                        </div>
                                        <div className="bg-white mt-8 w-64 font-bold p-4 rounded-xl shadow-lg">
                                            <div className="flex justify-between items-center px-3 mb-1">
                                                <p className=" text-black">Service Project Request</p>
                                            </div>

                                            <p className="text-[#293988] px-2 text-sm font-medium">
                                                Time for Resolution: <span className=" text-red-400">No Match</span>
                                            </p>
                                        </div>

                                    </div>


                                   
                                </div>
                              



                            </div>
                        </div>
                    </div>



                    <div className=" mt-12 w-[90%]">
                        <h1 className=" font-bold text-xl my-5 ">ISSUE</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam placerat quis massa et volutpat. Vestibulum sed faucibus lorem.
                            Vivamus euismod neque non tortor aliquam, vitae ullamcorper lectus facilisis. Nulla eget ex et neque ullamcorper semper in vitae felis.
                            Sed sagittis metus nec eros tincidunt, eu consectetur magna aliquet. Cras maximus porta mi id vehicula. Nam non feugiat sem.
                            Nulla ut faucibus quam.
                        </p>
                    </div>

                    <div className=" bg-white p-4 px-12 my-10 rounded-xl ">
                        <h1 className=" font-bold text-xl my-5 ">Article</h1>
                        <div className=" flex flex-col gap-6">

                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam placerat quis massa et volutpat. Vestibulum sed faucibus lorem.
                                Vivamus euismod neque non tortor aliquam, vitae ullamcorper lectus facilisis. Nulla eget ex et neque ullamcorper semper in vitae felis.
                                Sed sagittis metus nec eros tincidunt, eu consectetur magna aliquet. Cras maximus porta mi id vehicula. Nam non feugiat sem.
                                Nulla ut faucibus quam.
                            </p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam placerat quis massa et volutpat. Vestibulum sed faucibus lorem.
                                Vivamus euismod neque non tortor aliquam, vitae ullamcorper lectus facilisis. Nulla eget ex et neque ullamcorper semper in vitae felis.
                                Sed sagittis metus nec eros tincidunt, eu consectetur magna aliquet. Cras maximus porta mi id vehicula. Nam non feugiat sem.
                                Nulla ut faucibus quam.
                            </p>
                        </div>



                        <div className="flex my-16">
                            <div className="mt-6 flex-1 pr-4">
                                <h1 className="font-bold">REASON OF THE ISSUE</h1>
                                <ul className="list-disc p-4">
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                </ul>
                            </div>

                            <div className="border-r-2 border-gray-300 mx-16" />

                            <div className="mt-6 flex-1 pl-4">
                                <h1 className="font-bold">REASON OF THE ISSUE</h1>
                                <ul className="list-disc p-4">
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                                </ul>
                            </div>
                        </div>


                    </div>



                    <div className=" mt-16">

                        <h1 className=" font-bold text-xl my-5 ">Article</h1>

                        <div className=" bg-white p-4 px-7 my-6 rounded-xl">

                            <div className=" p-2">
                                <div className=" flex justify-between">
                                    <div>
                                        <h1 className=" font-bold">Name of Ariticle</h1>
                                        <p>Description of the Article</p>
                                    </div>
                                    <button className=" border border-[#306EBF] p-1 px-4  text-[#104084] rounded-lg ">
                                        View
                                    </button>

                                </div>

                                <div className=" mt-4 h-[4px] bg-gray-200" />
                            </div>
                            <div className=" p-2">
                                <div className=" flex justify-between">
                                    <div>
                                        <h1 className=" font-bold">Name of Ariticle</h1>
                                        <p>Description of the Article</p>
                                    </div>
                                    <button className=" border border-[#306EBF] p-1 px-4  text-[#104084] rounded-lg ">
                                        View
                                    </button>

                                </div>

                                <div className=" mt-4 h-[4px] bg-gray-200" />
                            </div>
                            <div className=" p-2">
                                <div className=" flex justify-between">
                                    <div>
                                        <h1 className=" font-bold">Name of Ariticle</h1>
                                        <p>Description of the Article</p>
                                    </div>
                                    <button className=" border border-[#306EBF] p-1 px-4  text-[#104084] rounded-lg ">
                                        View
                                    </button>

                                </div>

                                <div className=" mt-4 h-[4px] bg-gray-200" />
                            </div>
                            <div className=" p-2">
                                <div className=" flex justify-between">
                                    <div>
                                        <h1 className=" font-bold">Name of Ariticle</h1>
                                        <p>Description of the Article</p>
                                    </div>
                                    <button className=" border border-[#306EBF] p-1 px-4  text-[#104084] rounded-lg ">
                                        View
                                    </button>

                                </div>

                                <div className=" mt-4 h-[4px] bg-gray-200" />
                            </div>




                        </div>

                    </div>





                </div>
            </main >
            <ChatbotPopup/>
        </div >
    )
}
