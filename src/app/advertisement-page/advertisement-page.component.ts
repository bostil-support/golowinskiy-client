import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Headers} from '@angular/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {environment} from 'src/environments/environment';
import {Message} from 'src/app/shared/models/message.model';
import {AuthService} from 'src/app/shared/services/auth.service';
import {MainService} from '../shared/services/main.service';
import {CategoryItem} from '../categories/categories.component';
import {AdditionalImagesData} from '../shared/interfaces';
import {of} from 'rxjs';
import {StorageService} from '../shared/services/storage.service';
import {CategoriesService} from '../shared/services/categories.service';

export interface ImageDataInterface {
  src: string;
  name: string;
  blob: Blob;
}

@Component({
  selector: 'app-advertisement-page',
  templateUrl: './advertisement-page.component.html',
  styleUrls: ['./advertisement-page.component.scss']
})
export class AdvertisementPageComponent implements OnInit {

  apiRoot
  userId
  cust_id

  form: FormGroup
  data_form: any

  message: Message

  showSpinner = true
  isDisabled = true

  idCategory
  itemName = ''
  categories: CategoryItem[] = []
  showCatalog = false

  fio
  userName
  phone


  // new images code
  mainImageData: ImageDataInterface = {
    src: '',
    name: '',
    blob: null
  }
  additionalImagesData: ImageDataInterface[] = []

  // categories
  initialCategories: CategoryItem[] = []

  @ViewChild('submitButton') submitButton: ElementRef
   advertId: string = "1";
  constructor(
    private router: Router,
    private authService: AuthService,
    private mainService: MainService,
    public storageService: StorageService,
    private categoriesService: CategoriesService
  ) { }

  ngOnInit() {
    this.apiRoot = environment.api
    this.form = new FormGroup({
      'Article': new FormControl(null),
      'TName': new FormControl(null, [Validators.required]),
      'TDescription': new FormControl(null),
      'TCost': new FormControl(null),
      'TImageprev': new FormControl(null),
      'TypeProd': new FormControl(null),
      'PrcNt': new FormControl(null),
      'TransformMech': new FormControl(null),
      'Ctlg_Name': new FormControl(null),
      'Categories': new FormControl(null, [Validators.required]),
      'youtube': new FormControl(null)
    })
    this.message = new Message('danger', '')
    this.fio = localStorage.getItem('fio')
    this.userName = localStorage.getItem('userName')
    this.phone = localStorage.getItem('phone')
    this.mainService.getShopInfo().subscribe(
      (res) => {
        this.cust_id = res.cust_id;
        this.userId = this.authService.getUserId()
        let advert = window.location.pathname.includes('addProduct')? '1': null
        let userId = window.location.pathname.includes('cabinet')? this.authService.getUserId(): null
        this.showSpinner = false
      }
    )
    this.categoriesService.fetchCategoriesAll(null,this.advertId);
    this.initialCategories = this.storageService.getCategories();
    this.storageService.breadcrumbFlag = false;
  }

  private showMessage( text: string, type:string = 'danger'){
    this.message = new Message(type, text)
    window.setTimeout(() => {
      this.message.text = ''
      if(this.message.type == 'success'){
        this.router.navigate(['/addProduct'])
      }
    }, 2000)
  }

  loadFile(files: File, callback: (src: string, name: string) => any) {
    const file = files;
    const reader = new FileReader();
    reader.onload = () => callback(reader.result.toString(), file.name);
    reader.readAsDataURL(file);
  }

  redraw(element: ImageDataInterface, angle: number) {
    const image: HTMLImageElement = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      [canvas.width, canvas.height] = [image.width, image.height];
      if (angle === Math.abs(90)) {
        [canvas.width, canvas.height] = [canvas.height, canvas.width];
      }
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(angle * Math.PI / 180);
      context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
      context.restore();
      canvas.toBlob((blob: Blob) => {
        element.blob = blob;
      });
      element.src = canvas.toDataURL();
    };
    image.src = element.src;
  }

  removeAdditionalImage(index: number) {
    this.additionalImagesData.splice(index, 1);
  }

  Validators(el){
    this.itemName = el.txt
  }

  mainFileSelected(event){
    const file = <File>event.target.files[0]
    // this.selectedFile = <File>event.target.files[0]
    this.loadFile(file, (src, name) => {
      this.mainImageData.src = src
      this.mainImageData.name = name
      this.redraw(this.mainImageData, 0)
      this.isDisabled = false
    })
  }

  additionalImagesAdd(event){
    const file = <File>event.target.files[0]
    this.loadFile(file, (src, name) => {
      const item: ImageDataInterface = {
        src,
        name,
        blob: null
      }
      this.additionalImagesData.push(item)
      this.redraw(item, 0)
    })
  }

  additionalImagesChange(event, index){
    const file = <File>event.target.files[0]
    this.loadFile(file, (src, name) => {
      const item = this.additionalImagesData[index]
      item.src = src
      item.name = name
      this.redraw(item, 0)
    })
  }

  isFormValid(): boolean {
    console.log("isFormValid");
    console.log(this.form.valid);  
    return this.form.valid;

  }

  createForm() {
    this.form = new FormGroup({
      'Article': new FormControl(null),
      'TName': new FormControl(null, [Validators.required]),
      'TDescription': new FormControl(null),
      'TCost': new FormControl(null),
      'TImageprev': new FormControl(null),
      'TypeProd': new FormControl(null),
      'PrcNt': new FormControl(null),
      'TransformMech': new FormControl(null),
      'Ctlg_Name': new FormControl(null),
      'Categories': new FormControl(this.form.value.Categories, [Validators.required]),
      'youtube': new FormControl(null)
    })
  }

  successAddedProduct(Ctlg_Name){
    this.showSpinner = false
    this.showMessage('Объявление было успешно размещено', 'success')
    this.createForm()
    this.itemName = Ctlg_Name
    this.isDisabled = true
    this.mainImageData = {
      src: '',
      name: '',
      blob: null
    }
    this.additionalImagesData = []
  }

  onSubmit() {
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf8',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    })
    this.showSpinner = true
    this.submitButton.nativeElement.disabled = true
    const formData = this.form.value

    this.data_form = {
      "Catalog": this.cust_id,      //nomer catalog
      "Id": this.idCategory,         // post categories/
      "Ctlg_Name": formData.Categories,     //input form
      "TArticle": formData.Article, //input form
      "TName": formData.TName, //input form
      "TDescription": formData.TDescription, //input form
      "TCost": formData.TCost, //input form
      "Appcode": this.cust_id,
      "TypeProd": formData.TypeProd, //input form
      "PrcNt": formData.PrcNt, //input form
      "TransformMech": formData.TransformMech,  //input form
      "CID": this.userId, // userId for auth,
      "video": formData.youtube
    }
    if (this.mainImageData.blob) {
      this.data_form['TImageprev'] = this.mainImageData.name
    }
    this.mainService.getUserInfo(headers).subscribe((res: any) => {
      this.Validators(this.data_form.Ctlg_Name)
      if (res.isCanPromo === true) {
        this.showSpinner = true;

        let imgObserv = of({})
        if (this.mainImageData.blob) {
          const formData = new FormData()
          formData.append('AppCode', this.cust_id)
          formData.append('Img', this.mainImageData.blob)
          formData.append('TImageprev', this.mainImageData.name)
          imgObserv = this.mainService.uploadImage(formData)
        }

        imgObserv.subscribe(() => { 
            this.mainService.addProduct(this.data_form, headers)
              .subscribe((res: any) => {
                const data: AdditionalImagesData[] = []
                for (let i = 0; i < this.additionalImagesData.length; i++) {
                  let name = this.additionalImagesData[i].name;
                  name = name.replace(/(\.[\w\d_-]+)$/i, `${i}'$1`)
                  const formData = new FormData();
                  data.push({
                    imageData: formData,
                    request: {
                      catalog: this.cust_id,
                      id: this.idCategory,
                      prc_ID: res.prc_id,
                      imageOrder: i,
                      tImage: name,
                      appcode: this.cust_id,
                      cid: this.userId
                    }
                  })
                  formData.append('AppCode', this.cust_id)
                  formData.append('Img', this.additionalImagesData[i].blob)
                  formData.append('TImageprev', name)
                }
                this.mainService.additionalImagesGroup(data)
                  .subscribe(
                    () => this.successAddedProduct(this.data_form.Ctlg_Name),
                    () => console.log('additional images upload error'),
                    () => this.successAddedProduct(this.data_form.Ctlg_Name)
                  )
              })
              
          },
          () => {
            this.showSpinner = false
            this.showMessage('Объявление не было размещено', 'danger')
          })
      }
    })
  }

  categorySelect(items: CategoryItem[]) {
    this.categories = items
    let item = items[items.length - 1]
    this.itemName = item.txt
    this.idCategory = item.id
    this.showCatalog = false
  }

  breadcrumbsClick() {
    this.categories = []
    this.itemName = ''
    this.idCategory = ''
    this.showCatalog = true
  }

  private isCabinet(): boolean {
    return window.location.pathname.includes('cabinet')
  }

  onCategoriesClick(items: CategoryItem[]) {
    this.storageService.setCategories(items)
    this.mainService.saveCategoriesToStorage(items)
    const item = items[items.length - 1]
    //this.router.navigate([`${window.location.pathname}/categories/${item.id}/products`])
  }
}
