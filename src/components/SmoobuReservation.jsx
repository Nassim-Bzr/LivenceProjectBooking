import { useEffect, useRef } from "react";

export default function SmoobuReservation({ appartementId }) {
  const smoobuContainerRef = useRef(null);

  useEffect(() => {
    const scriptUrl = "https://login.smoobu.com/js/Settings/BookingToolIframe.js";
    let script = document.querySelector(`script[src="${scriptUrl}"]`);

    if (!script) {
      script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    script.onload = () => {
      if (window.BookingToolIframe && smoobuContainerRef.current) {
        smoobuContainerRef.current.innerHTML = "";
        window.BookingToolIframe.initialize({
          url: `https://login.smoobu.com/fr/booking-tool/iframe/${appartementId}`,
          baseUrl: "https://login.smoobu.com",
          target: "#smoobu-reservation-container",
        });
      }
    };

    return () => {
      if (smoobuContainerRef.current) {
        smoobuContainerRef.current.innerHTML = "";
      }
    };
  }, [appartementId]);

  return <div id="smoobu-reservation-container" ref={smoobuContainerRef} className="w-full" />;
}
