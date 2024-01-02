/***************************************************************************
 *                     CONSTANTS & VARIABLES
 ****************************************************************************/
let ROT = []
let formFactors = []
let selectedCategory = []
let addedVarients = []
let finalProducts = {}
let choosedCategory = ''
const productDetails = {}
const eSim = ['YES', 'NO']
const popup = document.getElementById('overlay')
const cartCount = document.getElementById('cart-count')
const offCanvas = document.getElementById('off-canvas')
const addedVarientTable = document.getElementById('added-varients')
const filteredItemTable = document.getElementById('filtered-products')
const noVarientText = document.getElementById('no-data-text')
const selectedVarText = document.getElementById('selected-varient-text')
const cartList = document.getElementById('product-infoBox')
const filteredTableBody = document.getElementById('table-body')
const cartTableTitles = ['#', 'Name', 'Region', 'Esim', 'Form Factor', 'Qty']
const list = ['rot-list', 'sim-list', 'ff-list']
const rotButton = document.getElementById('rot')
const simButton = document.getElementById('sim')
const ffButton = document.getElementById('ff')
const variantTableBodyNode = document.getElementById('varient-list-body')

/*****************************************************************************************
 *                             Event-Listeners
 *****************************************************************************************/
/**
 * @description Event listener to close dropdowns on clicking outside
 */
document.addEventListener('click', function (event) {
  const simList = document.getElementById('sim-list')
  const rotList = document.getElementById('rot-list')
  const ffList = document.getElementById('ff-list')

  if (
    event.target !== simButton &&
    !simButton.contains(event.target) &&
    event.target !== simList &&
    !simList?.contains(event.target)
  ) {
    simList.classList.remove('!block')
  }
  if (
    event.target !== rotButton &&
    !rotButton.contains(event.target) &&
    event.target !== rotList &&
    !rotList.contains(event.target)
  ) {
    rotList.classList.remove('!block')
  }
  if (
    event.target !== ffButton &&
    !ffButton.contains(event.target) &&
    event.target !== ffList &&
    !ffList.contains(event.target)
  ) {
    ffList.classList.remove('!block')
  }
})

document.addEventListener('DOMContentLoaded', function () {
  const filePath = '../Data/Frontend engineer.xlsx'
  fetch(filePath)
    .then(response => response.arrayBuffer())
    .then(data => {
      const arrayBuffer = data
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheet = workbook.Sheets['Product details ']

      for (let i = 2; i <= 31; i++) {
        const productKey = sheet[`A${i}`].v
        const category = productKey.split('-')[0].trim()
        const regionOfTesting = sheet[`B${i}`].v
        const eSim = sheet[`C${i}`].v
        const formFactors = sheet[`D${i}`].v.split(',').map(ff => ff.trim())

        if (!productDetails[category]) {
          productDetails[category] = []
        }

        productDetails[category].push({
          product: productKey,
          ROT: regionOfTesting,
          eSim: eSim,
          ff: formFactors
        })
      }
      ROT = getRegionOfTesting()
      formFactors = getFormFactor()
    })
    .then(() => {
      const productList = document.getElementById('productList')
      Object.keys(productDetails).forEach(category => {
        const li = document.createElement('li')
        const title = document.createElement('h4')
        const button = document.createElement('button')
        const img = document.createElement('img')
        const span = document.createElement('span')
        span.innerText = 'Add to Cart'
        img.src = '../assets/cart.svg'
        button.className =
          'rounded-full bg-blue-700 flex gap-3 items-center px-3 py-2 w-fit'
        button.appendChild(img)
        button.appendChild(span)
        li.appendChild(title)
        li.appendChild(button)
        title.textContent = category
        title.className = 'text-black text-xl'
        li.className =
          'rounded-lg bg-white flex flex-col gap-4 p-5 max-w-22 justify-center items-center'
        productList.appendChild(li)
        button.addEventListener('click', () => {
          choosedCategory = category
          handleProductSelection(category)
        })
      })
    })
    .catch(error => {
      console.error('Error fetching the Excel file:', error)
    })
})

/************************************************************************************
 *                             CUSTOM METHODS
 ************************************************************************************/

/**
 * @function getRegionOfTesting
 * @description listout the region of testing after removing duplicates
 * @returns {Array}
 */
function getRegionOfTesting () {
  return Object.keys(productDetails).reduce((acc, cat) => {
    acc = [
      ...new Set([...acc, ...productDetails[cat].map(item => item['ROT'])])
    ]
    return acc
  }, [])
}
/**
 * @function getFormFactor
 * @description listout the form factors after removing duplicates
 * @returns {Array}
 */

function getFormFactor () {
  return Object.keys(productDetails).reduce((acc, cat) => {
    const array = productDetails[cat].map(item => item['ff'])
    acc = [...new Set([...acc, ...array.flatMap(i => i)])]
    return acc
  }, [])
}

/**
 * @function handleProductSelection
 * @param {*} category
 * @description opens modal,set the title and stores selectedCategory
 * @return {void}
 */
function handleProductSelection (category) {
  popup.classList.add('!block')
  popup.querySelector('#modal-title').innerText = category
  selectedCategory = productDetails[category]
  setDropDownData()
}

/**
 * @function setDropDownData
 * @description all dropdown data are populated
 * @return {void}
 */
const setDropDownData = () => {
  list.forEach(v => {
    const data = v === 'rot-list' ? ROT : v === 'sim-list' ? eSim : formFactors
    data.forEach(key => {
      const listItem = document.createElement('li')
      listItem.className = 'px-3 py-2 text-xs cursor-pointer'
      listItem.textContent = key
      document.getElementById(v).append(listItem)
      listItem.addEventListener('click', () => handleFilterSelection(v, key))
    })
  })
}

/**
 * @function handleDropDownSelection
 * @description based on id , dropdown opens
 * @param {string} id
 */
const handleDropDownSelection = id => {
  document.getElementById(id).classList.add('!block')
}

/**
 * @function handleFilterSelection
 * @param {string} type - The type of filter (e.g., 'rot-list', 'sim-list', 'ff-list').
 * @param {string} selectedItem - The selected filter item.
 * @description filtering based on AND condition over 3 dropdown
 */
function handleFilterSelection (type, selectedItem) {
  document.getElementById(type.split('-')[0]).innerText = selectedItem
  filteredItemTable.classList.add('!block')
  document.getElementById(type).classList.remove('!block')

  const ROTValue = rotButton.innerText
  const eSimValue = simButton.innerText
  const ffValue = ffButton.innerText

  const filters = {
    ROT: ROTValue,
    eSim: eSimValue,
    ff: ffValue
  }

  const filteredResult = selectedCategory.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === 'Select') {
        return true
      }
      if (key === 'ff') {
        return item[key].includes(value)
      }
      return item[key] === value
    })
  })

  while (filteredTableBody.firstChild) {
    filteredTableBody.removeChild(filteredTableBody.firstChild)
  }

  if (filteredResult.length) {
    noVarientText.classList.add('hidden')
    filteredResult.forEach((filteredItem, index) => {
      const tbRow = document.createElement('tr')
      tbRow.className = 'h-10 border-b-2 border-grey-400'
      Object.keys(filteredItem).forEach(key => {
        const td = document.createElement('td')
        td.innerText = filteredItem[key]
        tbRow.append(td)
      })
      const td = document.createElement('td')
      const btn = document.createElement('button')
      btn.className =
        'bg-blue-700 text-white rounded-full px-3 py-1 font-semibold text-xs'
      btn.innerText = 'ADD VARIANT'
      btn.id = `myButton-${index}`
      btn.addEventListener('click', e => {
        addedVarients.push({ ...filteredItem, count: 0 })
        handleVariableBtn(e, index)
      })
      td.append(btn)
      tbRow.append(td)
      filteredTableBody.append(tbRow)
    })
  } else {
    noVarientText.classList.remove('hidden')
  }
}

/**
 * @function handleVariableBtn
 * @param {event} e
 * @param {number} index
 * @description shows variant table and shows the added item
 */
function handleVariableBtn (e, index) {
  addedVarientTable.classList.remove('hidden')
  selectedVarText.classList.add('!hidden')
  populateTableContent()
  const newDiv = document.createElement('div')
  newDiv.className = 'flex items-center'
  const addBtn = document.createElement('span')
  const counter = document.createElement('span')
  const minusBtn = document.createElement('span')
  addBtn.innerText = '+'
  addBtn.className =
    'bg-blue-700 rounded-r-full w-5 h-5 text-white text-center cursor-pointer'
  minusBtn.className =
    'bg-blue-700 rounded-l-full w-5 text-white h-5 text-center cursor-pointer'
  minusBtn.innerText = '-'
  counter.innerText = 0
  counter.id = `counter-${index}`
  counter.className = 'w-5 h-5 bg-white text-center'
  const button = document.getElementById(e.target.id)
  newDiv.appendChild(minusBtn)
  newDiv.appendChild(counter)
  newDiv.appendChild(addBtn)
  button.parentNode.replaceChild(newDiv, button)
  addBtn.addEventListener('click', () =>
    handleVarientChange('add', index, button, newDiv)
  )
  minusBtn.addEventListener('click', () =>
    handleVarientChange('minus', index, button, newDiv)
  )
}

/**
 * @function handleVarientChange
 * @param {*} type
 * @param {*} index
 * @param {*} button
 * @param {*} newDiv
 */
function handleVarientChange (type, index, button, newDiv) {
  const counter = document.getElementById(`counter-${index}`)
  const currentValue = Number(counter.innerText)
  if (type === 'add' && currentValue < 10) {
    counter.innerText = currentValue + 5
    addedVarients = addedVarients.map((v, i) =>
      index === i ? { ...v, count: currentValue + 5 } : v
    )
    document.getElementById(`count-${index}`).innerText = currentValue + 5
  } else if (type === 'minus') {
    if (currentValue > 0) {
      counter.innerText = currentValue - 5
      addedVarients = addedVarients.map((v, i) =>
        index === i ? { ...v, count: currentValue - 5 } : v
      )

      document.getElementById(`count-${index}`).innerText = currentValue - 5
    } else {
      newDiv.parentNode.replaceChild(button, newDiv)
      addedVarients = addedVarients.filter((_v, i) => i !== index)
      document.getElementById(`row-${index}`).remove()
    }
  }
}

/**
 * @function populateTableContent
 * @description populates the table content of selected varients
 */
function populateTableContent () {
  while (variantTableBodyNode.hasChildNodes()) {
    variantTableBodyNode.removeChild(variantTableBodyNode.firstChild)
  }
  addedVarients.forEach((filteredItem, index) => {
    const tbRow = document.createElement('tr')
    tbRow.id = `row-${index}`
    tbRow.className = 'h-10 border-b-2 border-grey-400'
    const sl = document.createElement('td')
    sl.innerText = index + 1
    tbRow.append(sl)
    Object.keys(filteredItem).forEach(key => {
      const td = document.createElement('td')
      td.id = `${key}-${index}`
      td.innerText = filteredItem[key]
      tbRow.append(td)
    })
    const td = document.createElement('td')
    const dltBtn = document.createElement('img')
    dltBtn.src = '../assets/delete.svg'
    dltBtn.id = `delete-${index}`
    dltBtn.className = 'cursor-pointer'
    dltBtn.addEventListener('click', e => {
      document.getElementById(`row-${index}`).remove()
      addedVarients = addedVarients.filter((_v, i) => i !== index)
    })
    td.append(dltBtn)
    tbRow.append(td)
    variantTableBodyNode.append(tbRow)
  })
}

/**
 * @function handleAddToCart
 * @description
 */
function handleAddToCart () {
  if (addedVarients.length) {
    finalProducts = { ...finalProducts, [choosedCategory]: addedVarients }
    cartCount.classList.add('!flex')
    document.getElementById('count').innerText =
      Object.keys(finalProducts).length
  } else {
    cartCount.classList.remove('!flex')
  }
  handleCancelBtn()
}

/**
 * @function handleCancelBtn
 * @description
 */
function handleCancelBtn () {
  popup.classList.remove('!block')
  handleReset()
}

/**
 * @function handleCartOpening
 * @param {string} action
 * @description
 */
const handleCartOpening = action => {
  if (action === 'close') {
    offCanvas.classList.remove('!flex')
    while (cartList.firstChild) {
      cartList.removeChild(cartList.firstChild)
    }
  } else {
    if (Object.keys(finalProducts).length) {
      offCanvas.classList.add('!flex')
      Object.keys(finalProducts).forEach(category => {
        const titleDiv = document.createElement('div')
        titleDiv.id = `${category}-container`
        const img = document.createElement('img')
        img.src = '../assets/delete.svg'
        img.className = 'cursor-pointer'
        const categoryTitle = document.createElement('h5')
        titleDiv.className = 'flex items-center justify-between'
        titleDiv.append(categoryTitle)
        titleDiv.append(img)
        categoryTitle.innerText = category
        cartList.append(titleDiv)
        const table = document.createElement('table')
        table.id = `${category}-table`
        table.className =
          'text-gray-500 font-medium text-sm border-y border-gray-400 w-full my-5'
        const tHead = document.createElement('thead')
        tHead.className = 'border-y border-grey-600'
        const tBody = document.createElement('tbody')
        const hRow = document.createElement('tr')
        hRow.className = 'text-left'
        table.append(tHead)
        table.append(tBody)
        tHead.append(hRow)
        cartTableTitles.forEach(title => {
          const tH = document.createElement('th')
          tH.innerText = title
          tH.className = 'py-2'
          hRow.append(tH)
        })
        cartList.append(table)
        img.addEventListener('click', () => deleteCategoryFromCart(category))

        finalProducts[category].forEach((item, index) => {
          const tr = document.createElement('tr')
          const sl = document.createElement('td')
          tr.append(sl)
          sl.innerText = index + 1
          Object.keys(item).forEach(key => {
            const td = document.createElement('td')
            td.id = `cart-${key}-${index}`
            td.innerText = item[key]
            td.className = 'py-1'
            tr.append(td)
          })

          tBody.append(tr)
        })
      })
    }
    return
  }
}

/**
 * @function handleReset
 * @description
 */
const handleReset = () => {
  selectedCategory = []
  addedVarients = []
  rotButton.innerText = 'Select'
  ffButton.innerText = 'Select'
  simButton.innerText = 'Select'
  while (filteredTableBody.firstChild) {
    filteredTableBody.removeChild(filteredTableBody.firstChild)
  }
  while (variantTableBodyNode.firstChild) {
    variantTableBodyNode.removeChild(variantTableBodyNode.firstChild)
  }
  list.forEach(v => {
    const ul = document.getElementById(v)
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild)
    }
  })

  selectedVarText.classList.remove('!hidden')
  addedVarientTable.classList.add('hidden')
}

function deleteCategoryFromCart (category) {
  delete finalProducts[category]
  document.getElementById('count').innerText = Object.keys(finalProducts).length
  cartList.removeChild(document.getElementById(`${category}-container`))
  cartList.removeChild(document.getElementById(`${category}-table`))
}
