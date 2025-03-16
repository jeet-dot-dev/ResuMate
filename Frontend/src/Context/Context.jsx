import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) =>{
  const [resume,setResume] = useState('');
  const [job,setJob] = useState('');
  const url = import.meta.env.VITE_API_URL;
    const contextValue = {
      resume,
      setResume,
      job,
      setJob,
      url
    }
    
    return (
        <StoreContext.Provider value={contextValue}>
          {props.children}
        </StoreContext.Provider>
      );

}

export default StoreContextProvider