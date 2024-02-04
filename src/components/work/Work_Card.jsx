import React from 'react'

function Work_Card({i,title, date, org, description}) {
  return (
    <div className='workCardContainer' >
        <div className='workTitle'>
            <h2>{title}</h2>
            <p>{date}</p>
        </div>
        <div className='org'>
            <h4>{org}</h4>
        </div>
        <div className='workDescription'>
          <ul>
          { description.map((d)=> (
                <li>{d}</li> 
            ))}
          </ul>
        </div>
    </div>
  )
}

export default Work_Card