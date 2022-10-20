import "amazon-connect-streams";
import { useCallback, useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2"
import 'react-phone-input-2/lib/style.css'
import "./CustomCcp.css"
import config from "./config"
import {Button, Row, Col} from "antd"
import {FiPhoneOutgoing, FiPhoneOff, FiPhoneCall,FiMicOff,FiMic, FiPause, FiPlay} from "react-icons/fi"
import { useContactIncoming, useContactOnEnd } from "./Hook";

export default function CustomCcp () {
  const [outboundNumber, setOutboundNumber] = useState<string>("");
  const [inputValid, setInputValid] = useState<boolean>(true); 
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [phoneStatus,setPhoneStatus] = useState<string>("");
  const [incoming,setIncoming] = useState<boolean>(false);
  const [isMute,setIsMute] = useState<boolean>(false);
  const [isHold,setIsHold] = useState<boolean>(false);

  const containerDiv = document.getElementById("container-div")!
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      console.log("init start");
      if (typeof window === "undefined") throw new Error("window missing");
      if (typeof window.connect === "undefined")
        throw new Error("global connect missing");
      window.connect.core.initCCP(ref.current!, {
        ccpUrl: config.ccpUrl,
        loginPopup: true,
        loginPopupAutoClose: true,
        pageOptions: {
          enableAudioDeviceSettings: true,
          enablePhoneTypeSettings: true,
        },
        softphone: { allowFramedSoftphone: true },
      });
      console.log("init end");
    } catch(err) {
      console.error(err)
    }
    }, [ref]); 

  const onIncoming = useCallback((v:boolean) => {
    try {
      console.warn("... onIncoming")
      setIncoming(v);
      console.warn("... set Incoming " + v)
    } catch (e) {
      console.error("couldn't set data", e);
    }
  }, [incoming,setIncoming]);
  useContactIncoming(onIncoming);
  const onEnd = useCallback(() => {
    try {
      console.warn("... onEnd")
      setIncoming(false);
      console.warn("... set Incoming false")
    } catch (e) {
      console.error("couldn't set data", e);
    }
  }, [setIncoming]);
  useContactOnEnd(onEnd)
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

  const callPhone = (number:string): void => {
     try{
      setPhoneStatus("発信しています")
      console.warn(number)
      console.warn("... start call phone")
       window.connect.agent((agent)=>{
       try{
          console.warn(agent)
          console.warn("... start agent")
          const endpoint = window.connect.Endpoint.byPhoneNumber("+" + number)
          console.warn(endpoint)
          agent.connect(endpoint,{
            queueARN: config.queueARN,
            success: () => {
              setPhoneStatus("発信中")
              console.warn("... success");
            },
            failure: (err) => {
              setPhoneStatus("発信失敗しました")
              console.warn("... failure");
              console.error(err);
            }
          })
        }catch(err){
          console.error(err)
        }
      })
    }
    catch(err) {
      console.error(err)
    }
  }

  const hangUpPhone = ():void => {
    try{
      console.warn("... start hang up")
      window.connect.agent((agent) => {
        const contacts = agent.getContacts()
        console.warn("... start contact")
        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];
          const conn = contact.getActiveInitialConnection();
          console.warn(conn)
          if(conn){
            conn.destroy({
              success: ()=> {
                  console.warn("... disconnected");
                  setPhoneStatus("切断しました")
              },
              failure: (err) => {
                  console.warn("... disconnection failed");
                  setPhoneStatus("切断失敗しました");
                  console.warn(err);
              },
            });
          }
        }
      })
    }
    catch(err){
      console.warn(err)
    }
  }
  const acceptPhone = ():void => {
    console.warn("... start accept phone")
    window.connect.agent((agent)=> {
      const contacts = agent.getContacts()
      console.warn("... start contact")
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        if(contact.isInbound() ) {
          contact.accept({
            success: () => {setPhoneStatus("通話中です");console.warn("... success");setIncoming(false);},
            failure: (err) => {setPhoneStatus("通話失敗しました");console.error("... failure", err);}
          })
        }
      }
    })
  }

  const rejectPhone = ():void => {
    console.warn("... start reject phone")
    window.connect.agent((agent)=> {
      const contacts = agent.getContacts()
      console.warn("... start contact")
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        if(contact.isInbound() ) {
          contact.reject({
            success: () => {setPhoneStatus("拒否しました");console.warn("... success");setIncoming(false);},
            failure: (err) => {setPhoneStatus("拒否に失敗しました");console.error("... failure", err);}
          })
        }
      }
    })
  }

  return (
    <div>
      <Row className="bg-frame">
        <Col span={24}>
        <div style={{textAlign:"center"}}>Custom Ccp</div>
        </Col>
      </Row>
      <Row className="bg-frame">
        <Col span={12} style={{backgroundColor:"#121212"}}>
          <div style={{backgroundColor:"#121212", padding:"5px",float:"right"}}>
          <Button className="gray" onClick={() => {setIsMute(!isMute)}}>
            {isMute
             ? (<span><FiMic/><small>解除</small></span>)
             : (<span><FiMicOff/><small>ミュート</small></span>)
            }
          </Button>
          <Button className="gray" onClick={() =>{setIsHold(!isHold)}}>
            {isHold
             ? (<span><FiPlay/><small>解除</small></span>)
             : (<span><FiPause/><small>保留</small></span>)
            }
          </Button>
          <Button className="green" onClick={() => callPhone(outboundNumber)}>
            <FiPhoneOutgoing/><small>発信</small>
          </Button>
          <Button className="red" onClick={() => hangUpPhone()}>
            <FiPhoneOff/><small>切断</small>
          </Button>
          </div>
        </Col>
        <Col span={6}>
          <div style={{width:"155px"}}>
            <PhoneInput
              country={'jp'}
              onlyCountries={["jp","us"]}
              placeholder="Enter phone number"
              value={outboundNumber}
              onChange={(phone) => setOutboundNumber(phone)}
              isValid={inputValid}
              />
          </div>
        </Col>
        <Col span={6}>
          {(incoming) ? (
            <span>受電中 ...
              <Button className="green" onClick={() => acceptPhone()}>
                <FiPhoneCall/><small>通話</small>
              </Button>
              <Button className="red" onClick={() => rejectPhone()}>
                <FiPhoneOff/><small>拒否</small>
              </Button>              
            </span>
          ) : null }
        </Col>
     </Row>
     <Row>
      <Col span={6}>
      </Col>
      <Col span={12}>
          {phoneStatus}
      </Col>
      <Col span={6}>
      </Col>
    </Row>
    <Row>
      <div ref={ref} className="container-div" style={{ width: "100%", height: "30%", minHeight: 480, minWidth: 400 }}/>
    </Row>
   </div>
  );
}