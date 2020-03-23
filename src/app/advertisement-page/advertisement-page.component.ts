import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Headers} from '@angular/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {environment} from 'src/environments/environment';
import {Message} from 'src/app/shared/models/message.model';
import {AuthService} from 'src/app/shared/services/auth.service';
import {MainService} from '../shared/services/main.service';
import {CategoryItem, CategoriesComponent} from '../categories/categories.component';
import {AdditionalImagesData} from '../shared/interfaces';
import {of, BehaviorSubject, Subscription} from 'rxjs';
import {StorageService} from '../shared/services/storage.service';
import {CategoriesService} from '../shared/services/categories.service';
import { CommonService } from '../shared/services/common.service';

export interface ImageDataInterface {
  src: string;
  name: string;
  blob?: Blob;
  file: File
}

@Component({
  selector: 'app-advertisement-page',
  templateUrl: './advertisement-page.component.html',
  styleUrls: ['./advertisement-page.component.scss']
})
export class AdvertisementPageComponent implements OnInit {
  headers = new Headers({
    'Content-Type': 'application/json; charset=utf8',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  })
  apiRoot
  userId
  cust_id
  uploadStatus: boolean = false;
  form: FormGroup
  data_form: any

  message: Message

  showSpinner = true
  isDisabled = true
  public _imageNotLoaded = new BehaviorSubject<boolean>(false);
  idCategory
  itemName = ''
  categories: CategoryItem[] = []
  showCatalog = false

  fio
  userName
  phone
  isCanPromo: boolean = false;
  prc_id;
  loadingImage: string = null;
  loadingMini: string = null;
  loadingSpinner: string = null;
  // new images code
  mainImageData: ImageDataInterface = {
    src: '',
    name: '',
    file: null
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
    private categoriesService: CategoriesService,
    private commonStore : CommonService
  ) { 
    this.loadingMini = this.loadingImage = this.commonStore.loadingLittleRedSpinner;
    this.loadingSpinner = this.commonStore.loadingImageSpinner;
  }

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
        this.showSpinner = false
      }
    )
    this.categoriesService.fetchCategoriesAll(null,this.advertId);
    this.initialCategories = this.storageService.getCategories();
    this.storageService.breadcrumbFlag = false;
    this.mainService.getUserInfo().subscribe((res: any) => {
      this.isCanPromo = res.isCanPromo;
    });
  }

  private showMessage( text: string, type:string = 'danger',redirect: boolean = true,showSpinner: boolean = false,hideMessage: boolean = true){
    this.message = new Message(type, text,showSpinner)
    window.setTimeout(() => {
      if(hideMessage)
      this.message.text = ''
      if(this.message.type == 'success' && redirect){
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
    console.log(element)
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
  selectedFile: File = null;
  mainFileSelected(event){
    const file = this.selectedFile = <File>event.target.files[0];
    this.mainImageData.src = this.loadingSpinner;
    this.uploadStatus = true;
    setTimeout(()=>{
      this.loadFile(file, (src, name) => {
        this.mainImageData = {src, name: name.replace(/(\.[\w\d_-]+)$/i, `${Math.round(Math.random() * 100)}$1`), file}
        this.uploadStatus = false;
        this.uploadImages(this.mainImageData);
    //   this.redraw(this.mainImageData, 0)
        this.isDisabled = false
      })
    },500)
  }
  
  selectedFiles: File = null;
  additionalImagesAdd(event){
    this.uploadStatus = true;
    this.additionalImagesData.push({
      src: this.loadingSpinner,
      name: null,
      blob: null,
      file: null
    });
    const file = this.selectedFiles = <File>event.target.files[0]
    setTimeout(()=>{
      this.loadFile(file, (src, name) => {
        const item: ImageDataInterface = {
          src,
          name: name.replace(/(\.[\w\d_-]+)$/i, `${Math.round(Math.random() * 100)}$1`),
          file
        }
        //  this.additionalImagesData.pop();
          this.additionalImagesData[this.additionalImagesData.length - 1] = item;
          this.uploadImages(item);
       //   this.additionalImagesData.push(item)
           this.uploadStatus = false;
        //   this.redraw(item, 0)
      });
    },500)
  }

  additionalImagesChange(event, index){
    this.showSpinner = true;
    const file = <File>event.target.files[0]
    this.loadFile(file, (src, name) => {
      const item = this.additionalImagesData[index];
      item.src = src;
      item.name = name;
      item.file = file;
      this.showSpinner = false;
      this.redraw(item, 0)
    })
  }

  isFormValid(): boolean {
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
      blob: null,
      file: null
    }
    this.additionalImagesData = []
  }
  countUploadImgs: number = 0;
  countAdditionalImgs: number = 0;
  subscriptionImages : Subscription;
  onSubmit() {
    this.showMessage('Идет загрузка ', 'primary',false,true,false);
    this.submitButton.nativeElement.disabled = true;
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
    this.subscriptionImages = this._imageNotLoaded.subscribe((res)=>{
      if(!res){
        if (this.selectedFile) {
          this.data_form['TImageprev'] = this.mainImageData.name
        }
          if (this.isCanPromo === true) {
              this.Validators(this.data_form.Ctlg_Name)
                this.mainService.addProduct(this.data_form, this.headers)
                  .subscribe((res: any) => {
                    const data: AdditionalImagesData[] = []
                    for (let i = 0; i < this.additionalImagesData.length; i++) {
                      let name = this.additionalImagesData[i].name;
                      data.push({
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
                    }
                    this.mainService.additionalImagesArray(data).subscribe(()=>{
                      this.countAdditionalImgs +=1;
                      if(this.countAdditionalImgs == this.additionalImagesData.length){
                        this.successAddedProduct(this.data_form.Ctlg_Name);
                      }
                    });
                    if(this.additionalImagesData.length == 0)
                    this.successAddedProduct(this.data_form.Ctlg_Name)
                  })
          }else{
            alert("isCanPromo is false")
          } 
          this.subscriptionImages.unsubscribe();       
      }
    })
  }
  uploadedImageStatuses = new Map();
  showStatus(name,loaded,total){
    const percent = Math.ceil(loaded / total * 100);
    const element = document.getElementById(name);
    element ? (element as any).value = percent: '';
  }
  uploadImages(additionalImagesData){
    const name = additionalImagesData.name;
    const formData = new FormData();
    formData.append('AppCode', this.cust_id)
    formData.append('Img', additionalImagesData.file)
    formData.append('TImageprev', name)
    this.uploadedImageStatuses.set(name,false);
    this._imageNotLoaded.next(true)
    this.mainService.uploadImageXHR(formData,name,this.showStatus).subscribe(() => {
      this.uploadedImageStatuses.set(name,true);
      const element = document.getElementById(name);
      if(element)
        element.style.display = "none";
      this._imageNotLoaded.next(!Array.from(this.uploadedImageStatuses.values()).every(obj=>obj))
    });
  }
/*
  timeLeft: number = 0;
  interval;
  startTimer() {
    this.interval = setInterval(() => {
        this.timeLeft++;
    },1000)
  }
  pauseTimer() {
    clearInterval(this.interval);
    console.log('images request timer = '+this.timeLeft+' sec.')
  }
*/
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
