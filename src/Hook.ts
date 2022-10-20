import "amazon-connect-streams"
import {useEffect} from "react"

const useContactPrivate = (callback:Function) => {
  useEffect(() => {
    let isCancelled = false;
    // Don't destructure sub
    window.connect.contact((c) => {
      console.log("... contacted");
      try {
        if (isCancelled === false) {
          callback(c);
        } else {
          console.log("... was canceled, not calling callback");
        }
      } catch (e) {
        console.error("connect error", e);
      }
    });
    return () => {
      isCancelled = true;
      console.log("... unsubscribing");
    };
  }, [callback]);
};

export const useContact = (callback:Function) => {
  useContactPrivate(callback);
};

export const useContactOnEnd = (callback:Function) => {
  console.warn("... start on end");

  useContactPrivate((c:connect.Contact) => {
    c.onEnded(() => {
      console.log("... on ended");
      try {
        callback();
      } catch (e) {
        console.error("connect error", e);
      }
    });
  });
};

export const useContactIncoming = (callback:Function) => {
  useEffect(() => {
    let isCancelled = false;
    window.connect.contact((c) => {
      console.log("... calling");
      try {
        if (isCancelled === false) {
          callback(true);
        } else {
          callback(false)
          console.log("... hung up by caller");
        }
      } catch (e) {
        callback(false)
        console.error("connect error", e);
      }
    });
    return () => {
      isCancelled = true;
      console.log("... call end by caller");
    };
  }, [callback]);
}

export const useContactConnecting = (callback:Function) => {
  console.warn("... start connecting");

  useContactPrivate((c:connect.Contact) => {
    c.onConnecting(() => {
      console.log("... on connecting");
      try {
        callback(c.isInbound());
      } catch (e) {
        console.error("... connect error", e);
      }
    });
  });
};
