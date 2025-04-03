import React from "react";

export default function TicketDetails({ ticket, ticketFields }) {
    console.log("ticketFields",ticketFields)
  return ticketFields.map(({ label, key }) => (
    <div key={key} className="flex gap-10 items-center mb-5">
      <h1 className="w-40 font-medium">{label}</h1>
      <p>
        {Array.isArray(ticket?.[key])
          ? ticket[key].length > 0
            ? ticket[key].join(", ")
            : "None"
          : ticket?.[key] || "N/A"}
      </p>
    </div>
  ));
}
