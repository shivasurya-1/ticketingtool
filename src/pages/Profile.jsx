import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatbotPopup from "../components/ChatBot";
import { User, Mail, MapPin, Calendar, FileText, Award, Edit, Phone } from "lucide-react";

export default function Profile() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-full py-2 px-4 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-[#093D80] p-6 text-white">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white">
                  <img 
                    src="/api/placeholder/150/150" 
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md text-blue-600">
                  <Edit size={14} />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Sridevi Gedela</h2>
                <p className="flex items-center gap-1 text-blue-100">
                  <Award size={16} />
                  <span>Senior App Developer</span>
                </p>
                <div className="flex gap-4 mt-3">
                  <button className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors">
                    Edit Profile
                  </button>
                  <button className="bg-transparent border border-white text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
                    View Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              {["personal", "work", "skills", "documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab 
                      ? "border-b-2 border-blue-600 text-blue-600" 
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="p-6">
            {activeTab === "personal" && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Account Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Employee Number</p>
                          <p className="font-medium">123456</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-medium">sridevi@sriinfotech.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">+91 98765 43210</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">Hyderabad, India</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium">June 5, 2002</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-medium">App Development</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                      <button className="text-blue-600 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { action: "Updated profile picture", time: "2 hours ago" },
                        { action: "Completed project milestone", time: "Yesterday" },
                        { action: "Submitted expense report", time: "3 days ago" }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                          <p>{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab !== "personal" && (
              <div className="text-center py-8 text-gray-500">
                <p>Content for {activeTab} tab will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <ChatbotPopup />
    </div>
  );
}