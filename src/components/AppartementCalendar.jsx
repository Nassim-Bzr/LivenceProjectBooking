export default function AppartementCalendar() {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div id="smoobuCalendarIframe">
          <link
            rel="stylesheet"
            type="text/css"
            href="https://login.smoobu.com/css/singleCalendarWidgetIframe.css"
          />
  
          <iframe
            className="smallDevices block lg:hidden"
            height="540px"
            width="100%"
            src="https://login.smoobu.com/fr/cockpit/widget/show-calendar-iframe/2603523/3cf3e4328145c1b71918900fe1894523be49943685eace8e86e99295e5890532"
            frameBorder="0"
            title="Calendrier appartement mobile"
          />
  
          <iframe
            className="bigDevices hidden lg:block"
            height="600px"
            width="100%"
            src="https://login.smoobu.com/fr/cockpit/widget/show-calendar-iframe/2603523/3cf3e4328145c1b71918900fe1894523be49943685eace8e86e99295e5890532"
            frameBorder="0"
            title="Calendrier appartement desktop"
          />
        </div>
      </div>
    );
  }
  