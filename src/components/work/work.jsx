import React from 'react'
import {info}from './info'
import WorkCard from './Work_Card'
import './work.css'

function work() {
  return (
    <div  className='work' id="work">
    <div className='title_container'>
    <div className="title">
        <h3>Work</h3>
    </div>
    </div>
    <div className='workcards'>
    {
      info.map((w,i) => {
        return <WorkCard key={`p_${i}`} i={i} {...w}/>
      })
    }
    </div>
     
</div>
  )
}

export default work