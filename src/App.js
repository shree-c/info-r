import { useState, useEffect } from 'react'
const mainOpts = [
  {
    _id: "m",
    name: "manufacturers"
  },
  {
    _id: "b",
    name: "batches"
  },
  {
    _id: "e",
    name: "esps"
  },
  {
    _id: "p",
    name: "picIds"
  }
]

const tempMlist = [
  { name: 'boo', _id: 1 },
  { name: 'xoxo', _id: 2 },
  { name: 'momo', _id: 5 }
]

const tempBlist = [
  { name: 'poo', _id: 11 },
  { name: 'yoyo', _id: 12 },
  { name: 'lolo', _id: 15 }
]

async function getManufacturerList() {
  const res = await fetch('http://localhost:5000/api/v1/getAllManufacturers', {
    method: 'GET',
  })
  return await res.json()
}
async function getBatchList(batchID) {
  const res = await fetch(`http://localhost:5000/api/v1/getBatchesForManufacturer?${new URLSearchParams({ id: batchID })}`, {
    method: 'GET'
  })
  return await res.json()
}
function Menu({ list, name, value, onChange }) {
  return (
    <div className='select'>
      <label>
        {name} :
        {!list || list.length === 0 ? (
          <select disabled></select>
        ) : (
          <select value={value || list[0].value} onChange={onChange}>
            {list.map((e) => {
              return <option value={e._id} key={e._id}>{e.name}</option>
            })}
          </select>
        )}
      </label>
    </div>
  )
}

function DataInput({ placeholder, handleClick, id, inpVal, onChange, error }) {
  return (
    <div className='inpEle' id={`id-${id}`}>
      <input value={inpVal} type='text' onChange={(e) => onChange(e, id)} placeholder={placeholder} />
      <p className='error-p'>{error}</p>
      <button onClick={() => handleClick(id)} className="px-5 py-2 border-3 border-gray-900-600 bg-red-500">delete</button>
    </div>
  )
}

async function customFetch(url, headers, method, body, otherFields) {
  console.log(url)
  const res = await fetch(url, {
    ...otherFields,
    method,
    headers,
    body
  })
  return await res.json()
}

async function makeReqs(array, url) {
  const resArr = []
  for (let i = 0; i < array.length; i++) {
    const res = await customFetch(url, { 'content-type': 'application/json' }, 'POST', JSON.stringify(array[i]))
    resArr.push({ ...res, id: array[i].key })
  }
  return resArr
}
const postUrls = {
  'm': 'http://localhost:5000/api/v1/addSingleManufacturer',
  'e': 'http://localhost:5000/api/v1/addSingleEsp',
  'b': 'http://localhost:5000/api/v1/addSingleBatch',
  'p': 'http://localhost:5000/api/v1/addSinglePic',
}

function InputArea({ placeholder, f, m, b }) {
  const [key, setkey] = useState(1)
  const [children, setchildren] = useState([{ key, value: '' }])
  const [errors, seterrors] = useState([])
  const handleSubmit = async () => {
    const formattedBodyArray = children.map((ele) => {
      return {
        manufacturerId: m,
        batchId: b,
        value: ele.value,
        key: ele.key
      }
    }
    )
    const res = await makeReqs(formattedBodyArray, postUrls[f])
    res.forEach((v) => {
      if (!v.success) {
        seterrors([...errors, { error: v.error, id: v.id }])
      }
    })
  }

  useEffect(() => {
    console.log('!')
    errors.forEach((ele) => {
      document.querySelector(`#id-${ele.id} > .error-p`).innerText = ele.error
    })
  }, [errors])
  const handleAddmore = () => {
    setchildren((children) => {
      return [
        ...children,
        { key: key + 1, value: '' }
      ]
    })
    setkey(key + 1)
  }
  const handleDelete = (id) => {
    setchildren(children.filter(v => (v.key !== id)))
  }

  const handleChange = (e, id) => {
    setchildren((children) => {
      const temp = children.map((v) => {
        if (v.key === +id) {
          v.value = e.target.value
        }
        return v
      })
      return temp
    })
  }
  return (
    <div id='inputArea'>
      <div id='inpElements'>
        {children.map((v, index) => {
          return <DataInput key={index} id={v.key} placeholder={placeholder} handleClick={handleDelete} inpVal={v.value} onChange={handleChange} error={v.error} />
        })}
      </div>
      <button onClick={handleSubmit}>submit</button>
      <button onClick={handleAddmore}>Add more </button>
    </div>
  )
}


function MenuGroup({ mainFields, selectedField, batchList, manufacturerList, onFieldChange, mChange, bChange }) {
  return (
    <div className="container">
      <Menu list={mainFields} name="main field" onChange={onFieldChange} value={selectedField} />
      <Menu list={manufacturerList.list} name="manufacturers" value={manufacturerList.selectedVal} onChange={mChange} />
      <Menu list={batchList.list} name="batches" value={batchList.selectedVal} onChange={bChange} />
    </div>
  )
}

const placeHolderTable = {
  e: 'esp name',
  p: 'pic Id',
  b: 'batch name',
  m: 'manufacturer name'
}

function App() {
  const [fieldVal, setfieldVal] = useState(mainOpts[0].value)
  const [mlist, setmlist] = useState({ list: [], selectedVal: '' })
  const [blist, setblist] = useState({ list: [], selectedVal: '' })

  const handleFieldChange = (e) => {
    if (e.target.value === 'b' || e.target.value === 'e') {
    } else if (e.target.value === 'p') {
    }
    setfieldVal(e.target.value)
  }
  useEffect(() => {
    if (fieldVal === 'b' || fieldVal === 'e' || fieldVal === 'p') {
      (async function () {
        let manufList = await getManufacturerList()
        setmlist({ list: manufList.body, selectedVal: manufList.body[0]._id })
      })()
      setblist({ list: [], selectedVal: '' })
    } else if (fieldVal === 'm') {
      setmlist({ list: [], selectedVal: '' })
      setblist({ list: [], selectedVal: '' })
    }
  }, [fieldVal])

  useEffect(() => {
    if (fieldVal === 'p') {
      (async function () {
        const batchList = await getBatchList(mlist.selectedVal)
        setblist({ list: batchList.body, selectedVal: batchList.body[0]._id })
      })()
    }
  }, [mlist])

  const handleMchange = (e) => {
    setmlist((v) => {
      return {
        ...v,
        selectedVal: e.target.value
      }
    })
  }
  const handleBchange = (e) => {
    setblist((v) => {
      return {
        ...v,
        selectedVal: e.target.value
      }
    })
  }

  return (
    <>
      <MenuGroup mainFields={mainOpts} selectedField={fieldVal} onFieldChange={handleFieldChange} bChange={handleBchange} mChange={handleMchange} batchList={blist} manufacturerList={mlist} />
      <InputArea placeholder={`${placeHolderTable[fieldVal]}`} f={fieldVal} m={mlist.selectedVal} b={blist.selectedVal} />
    </>
  )
}

export default App
