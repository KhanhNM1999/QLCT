// Simple web preview logic to simulate app behaviour
const payments = []
const transactions = []

function fmt(v){ return new Intl.NumberFormat('vi-VN').format(Math.round(v)) }

function render(){
  const salaryEl = document.getElementById('salary')
  const savingsEl = document.getElementById('savings')
  const paymentsList = document.getElementById('paymentsList')
  const planList = document.getElementById('planList')

  let salary = transactions.length? transactions[0].amount : 0
  salaryEl.textContent = salary? ('VND ' + fmt(salary)) : 'Chưa có'

  const due = payments.reduce((a,p)=> a + (p.isRecurring? p.amount : p.amount), 0)
  const save = Math.max(0, salary - due)
  savingsEl.textContent = 'Tiết kiệm dự kiến: ' + fmt(save) + ' VND'

  paymentsList.innerHTML = ''
  payments.forEach((p, idx)=>{
    const li = document.createElement('li')
    li.innerHTML = `<div><strong>${p.name}</strong><div class="muted">${fmt(p.amount)} VND ${p.isRecurring? '· Trả góp' : ''}</div></div><div><button data-i='${idx}' class='mark'>Mark trả</button></div>`
    paymentsList.appendChild(li)
  })

  planList.innerHTML = ''
  payments.forEach(p=>{
    const li = document.createElement('li')
    li.innerHTML = `<div>${p.name}</div><div>${fmt(p.amount)} VND</div>`
    planList.appendChild(li)
  })

  document.querySelectorAll('.mark').forEach(b=> b.onclick = (e)=>{
    const i = +e.target.dataset.i
    payments.splice(i,1)
    render()
  })
}

function addPayment(name, amount, recurring){
  payments.push({name, amount: Number(amount), isRecurring: !!recurring})
  render()
}

function parseSalaryText(text){
  // look for patterns like +22.165.337VND or VND21,313,871 or numbers with separators
  const pat = /([+]?)([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(vnd)?/i
  const m = text.match(pat)
  if(m){
    let num = m[2].replace(/[.,]/g,'')
    const v = Number(num)
    return v
  }
  return null
}

document.getElementById('savePayment').onclick = ()=>{
  const name = document.getElementById('pname').value || 'Khoản mới'
  const amount = document.getElementById('pamount').value || '0'
  const recurring = document.getElementById('precurring').checked
  addPayment(name, Number(amount), recurring)
}

document.getElementById('addPaymentBtn').onclick = ()=>{
  document.getElementById('pname').focus()
}

document.getElementById('sample1').onclick = ()=>{
  document.getElementById('notifText').value = "(TPBank): 19/08/26;15:41 TK: xxxx2668886 PS:+22.165.337VND SD KHA DUNG: 22.198.783VND ND: Payslip FSOFT HO CHUYEN TIEN LUONG THANG 8"
}
document.getElementById('sample2').onclick = ()=>{
  document.getElementById('notifText').value = "Tai khoan/Account: 202****82001; +VND21,313,871; 19/06/2026. So du kha dung/Available Balance: VND21,313,871"
}

document.getElementById('shareBtn').onclick = ()=>{
  const t = document.getElementById('notifText').value
  const amt = parseSalaryText(t)
  if(amt && amt>0){
    transactions.unshift({amount: amt, date: new Date().toISOString(), raw: t})
    // keep only latest
    if(transactions.length>5) transactions.length = 5
    alert('Parsed salary: VND ' + fmt(amt))
    render()
  } else {
    alert('Không parse được số tiền. Hãy thử dán mẫu thông báo.')
  }
}

// initial demo data
addPayment('Thuê nhà', 5000000, true)
addPayment('Điện nước', 800000, false)
render()
