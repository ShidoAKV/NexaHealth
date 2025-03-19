

import { useContext, useEffect } from "react";
import { DoctorContext } from "../../Context/DoctorContext";

const DoctorMessageHistory = () => {
    const {dToken,messagedata,getmessagehistory}=useContext(DoctorContext);
    
    useEffect(() => {
      if(dToken){
        getmessagehistory();
      }
    }, [dToken,getmessagehistory])
    

  
  return (
        <>
              <div className='w-full max-w-6xl mx-auto my-5'>
                  <p className='mb-3 text-lg font-medium'>All Message History</p>
                  <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
                      {/* Header Row */}
                      <div className=' bg-blue-500 hidden sm:grid grid-cols-[1fr_2fr_2fr_1fr_2fr]  p-4 border-b'>
                          <p className='text-white font-medium'>#</p>
                          <p className='text-white font-medium'>Patient</p>
                          <p className='text-white font-medium'>Date & Time</p>
                          <p className='text-white font-medium'>Email</p>
                          <p className='text-center text-white font-medium'>Message count</p>
                      </div>
                      {/* Appointment Rows */}
                    
                       {
                        messagedata?.map((idx,item)=>(
                          
                           <div className="flex justify-evenly " key={item}>
                              <h1 className="text-black">{idx.patientName}</h1>
                              <h1 className="text-black">{(idx.date)}</h1>
                              <h1 className="text-black">{(idx.email)}</h1>
                              <h1 className="text-black">{(messagedata.length)}</h1>
                              
                              
                           </div>
            

                        ))
                       }

                  </div>
              </div>
      
              </>
      
  )
}

export default DoctorMessageHistory