import React from 'react'
import Navbar from './Components/Navbar'
import Resumeupload from './Components/Resumeupload'
import Ats from './Components/Ats'
import HowToUseSection from './Components/HowToUseSection'
import ScrollToTopButton from './Components/ScrollToTopButton '


const App = () => {
  return (
    <div className='w-full h-screen '>
      <Navbar/>
      <Resumeupload />
      <Ats/>
      <HowToUseSection/>
      <ScrollToTopButton/>
    </div>
  )
}

export default App