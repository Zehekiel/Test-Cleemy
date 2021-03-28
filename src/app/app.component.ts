import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'
import { Config } from './app.module'
import { FormControl } from '@angular/forms'
import { environment } from './../environments/environment'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})


export class AppComponent {
  currencyList = [
    {value:'USD', symbol: '$'},
    {value:'GBP', symbol: '£'},
    {value:'EUR', symbol: '€'},
    {value:'JPY', symbol: '¥'},
    {value:'CNY', symbol: '元'},
    {value:'KRW', symbol: '₩'}
  ]

  filterTypes = [
    {value:'createdAt', name: 'date de création'},
    {value:'lastModifiedAt', name: 'date de modification'},
    {value:'purchasedOn', name: 'date de dépense'},
  ]

  AllExpenseItems
  expensePage
  quotes
  setExpense = {id:'007', nature: 'default', comment: 'default', originalAmount: {amount: 0, currency: 'USD'}, convertedAmount: {amount: 0, currency: 'USD'}, purchasedOn:'' }
  numberPages
  actualPage=1

  constructor(private http: HttpClient) {  
    this.getHistoricRate('2020-02-20')
    this.getItems()
    this.getItemPage(this.actualPage)
  }

  // API
  addToExpense(newExpense) {
    return this.http.post<Config>(environment.configUrl, newExpense).subscribe(() => this.getItemPage(this.actualPage))
  }

  getItems() {
    return this.http.get<Config>(environment.configUrl).subscribe(res => {this.AllExpenseItems = res, this.createPagination(this.AllExpenseItems)})
  }

  getItemPage(page: number) {
    return this.http.get<Config>(`${environment.configUrl}?_page=${page}&_limit=10`).subscribe(res => {this.expensePage = res, this.getItems(), this.createPagination(this.AllExpenseItems), this.actualPage= page})
  }

  putOneItem(id :string) {
    console.log('id', id)
    return this.http.put<Config>(`${environment.configUrl}/${id}`, this.setExpense).subscribe(res => {console.log('res', res)})
    
  }

  getFilteredItem(date :string, type: string) {
    return this.http.get<Config>(`${environment.configUrl}?${type}=since,${date}`).subscribe(res => {this.expensePage= res, this.AllExpenseItems= res})
  }

  deleteOneExpense(id: string) {
    return this.http.delete(`${environment.configUrl}/${id}`).subscribe(res => {this.getItemPage(this.actualPage)})
  }

  createPagination(store: Array<any>) {
    this.numberPages= []
    const number : number = Math.ceil(store.length/10)
    
    for (let x=0; x< number; x++ ) {
      this.numberPages.push(x+1)
    }
  }

  // FILTER
  filterDate = new FormControl('')
  filterType = new FormControl('')

  getFilter(){
    if (this.filterDate.value !== '' && this.filterType.value !== '') {
      this.getFilteredItem(this.filterDate.value , this.filterType.value)
      this.createPagination(this.expensePage)
    }
  }

  // MODAL ADD EXPENSE
  nature = new FormControl('')
  comment = new FormControl('')
  originalAmount = new FormControl('')
  originalCurrency = new FormControl('')
  purchasedOn = new FormControl('')

  showModalAddExpense(){
    let modal_t  = document.getElementsByClassName('addmodalhidden')
    modal_t[0].classList.add('addmodalshow')
    modal_t[0].classList.remove('addmodalhidden')
  }

  closeModalAddExpense() {
    let modal_t  = document.getElementsByClassName('addmodalshow')
    modal_t[0].classList.add('addmodalhidden')
    modal_t[0].classList.remove('addmodalshow')
    this.nature.setValue('')
    this.comment.setValue('')
    this.originalAmount.setValue('')
    this.originalCurrency.setValue('')
    this.purchasedOn.setValue('')
  }

  saveExpense() {
    if (this.nature.value !== '' || this.comment.value !== ''|| this.originalAmount.value !== '' || this.originalCurrency.value !== ''|| this.purchasedOn.value !== ''){
      this.addToExpense({
        purchasedOn: this.purchasedOn.value,
        nature: this.nature.value.charAt(0).toUpperCase() + this.nature.value.slice(1),
        originalAmount: {
          amount: 17,
          currency: this.originalCurrency.value
        },
        convertedAmount: {
          amount: this.getConvertion(this.originalCurrency.value, this.originalAmount.value),
          currency: 'EUR'
        },
        comment: this.comment.value.charAt(0).toUpperCase() + this.comment.value.slice(1),
      })
    this.getItems()
    this.closeModalAddExpense()
    }
  }

  // CURRENCYLAYER
  getHistoricRate(purchasedOn: string) {
    this.http.get(`${environment.currencyLayerUrl}historical?access_key=${environment.currencyLayerKey}&date=${purchasedOn}`).subscribe((res: {quotes: Object})=> this.quotes= res.quotes )
  }

  getConvertion(localCurrency: string, amount: number): number {
    const localQuotes = `USD${localCurrency}`
    const changeRateLocalCurrencyToUSD = 1/ this.quotes[localQuotes]
    const USDToEUR = (USD: number) => {return (USD * this.quotes.USDEUR).toFixed(2)}
    const localCurrencyToUSD = (GBP: number) => {return (GBP * changeRateLocalCurrencyToUSD).toFixed(2)}

    if (localCurrency === 'USD') {
      return parseInt(USDToEUR(amount))
    } else if (localCurrency !== 'EUR') {
      return parseInt(localCurrencyToUSD(
        parseInt(USDToEUR(amount))
      ))
    } else {
      return amount
    }
  }

  // MODAL SET EXPENSE
  setNature = new FormControl('')
  setComment = new FormControl('')
  setOriginalAmount = new FormControl('')
  setOriginalCurrency = new FormControl('')
  setPurchasedOn = new FormControl('')

  showModalSetExpense(index: string): any{
    this.setExpense= this.expensePage[index]
    let modal_s  = document.getElementsByClassName('setmodalhidden')
      modal_s[0].classList.add('setmodalshow')
      modal_s[0].classList.remove('setmodalhidden')
  }

  closeModalsetExpense() {
    let modal_s  = document.getElementsByClassName('setmodalshow')
    modal_s[0].classList.add('setmodalhidden')
    modal_s[0].classList.remove('setmodalshow')
  }

  saveSetExpense() {
    const controlWhatFielSet = [
      {set: this.setNature.value, object: 'nature'},
      {set: this.setComment.value, object: 'comment'},
      {set: this.setPurchasedOn.value, object: 'purchasedOn'},
      {set: this.setOriginalAmount.value, object: 'originalAmount'},
      {set: this.setOriginalCurrency.value, object: 'originalCurrency'},
    ]

      for (let field of controlWhatFielSet){
        if (field.set !== '') {
          if (field.object === 'originalAmount'){
            this.setExpense['originalAmount'] = {amount: field.set, currency: this.setExpense.originalAmount.currency}
            this.setExpense['convertedAmount'] = {amount: this.getConvertion(this.setExpense.originalAmount.currency, field.set), currency: this.setExpense.convertedAmount.currency}
          } else if (field.object === 'originalCurrency') {
            this.setExpense['originalAmount'] = {amount: this.setExpense.originalAmount.amount, currency: field.set}
            this.setExpense['convertedAmount'] = {amount: this.getConvertion(field.set, this.setExpense.originalAmount.amount), currency: this.setExpense.convertedAmount.currency}
          } else {
            this.setExpense[field.object] = field.set
          }
        }
      }

      this.putOneItem(this.setExpense.id)
      this.closeModalsetExpense()
  }

}
