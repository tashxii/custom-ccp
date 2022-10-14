import "amazon-connect-streams";
import { useCallback, useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2"
import "./CustomCcp.css"
import config from "./config"
import {Button} from "antd"

export default function CustomCcp () {
  const containerDiv = document.getElementById("container-div")!
  useEffect(() => {
    try {
      console.log("init start");
      if (typeof window === "undefined") throw new Error("window missing");
      if (typeof window.connect === "undefined")
        throw new Error("global connect missing");
      window.connect.core.initCCP(containerDiv, {
        ccpUrl: config.ccpUrl,
        loginPopup: false,
        loginPopupAutoClose: false,
        pageOptions: {
          enableAudioDeviceSettings: true,
          enablePhoneTypeSettings: true,
        },
        softphone: { allowFramedSoftphone: true },
      });
      console.log("init end");
    } catch (e) {
      console.error(e);
    }
  }, [containerDiv]); 

  const [outboundNumber, setOutboundNumber] = useState<string>("")
  const [inputValid, setInputValid] = useState<boolean>(true); 
  const [alertVisible, setAlertVisible] = useState<boolean>(false);

  const validateInput = useCallback((value: string) => {
    console.log("validateInput");
    if (value.length > 0 && value.length < 12) {
      setInputValid(false);
      setAlertVisible(true);
      return false;
    } else {
      setInputValid(true);
      setAlertVisible(false);
      return true;
    }
  }, [setInputValid, setAlertVisible]);

  const callNumber = (number:string): void => {
    console.log(number)
     try{
       console.log("here1")
       window.connect.agent((agent)=>{
       console.log("here2")
       try{
          const endpoint = window.connect.Endpoint.byPhoneNumber("+" + number)
          console.warn(endpoint)
          var ARNs = agent.getAllQueueARNs();
          console.warn(ARNs)
          //endpoint.endpointARN = `${config.instanceARN}/transfer-destination/<TRANSFER_ID>`;
          //endpoint.endpointId = `${config.instanceARN}/transfer-destination/<TRANSFER_ID>`;
  
          agent.connect(endpoint,{
            queueARN: config.queueARN,
            success: () => {console.warn("success")},
            failure: (err) => {console.warn("failure");console.log(err)}
          })
        }catch(err){
          console.warn(err)
        }
      })
    }
    catch(err) {
      console.warn(err)
    }
  }
  return (
    <div>
      Custom Ccp
      <PhoneInput
        country={'jp'}
        onlyCountries={["jp"]}
        placeholder="Enter phone number"
        value={outboundNumber}
        onChange={(phone) => setOutboundNumber(phone)}
        isValid={inputValid}
      />
      <Button onClick={() => callNumber(outboundNumber)}>発信</Button>
    </div>
  );
}