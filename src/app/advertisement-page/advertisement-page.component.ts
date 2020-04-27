import {Component, ElementRef, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {Headers} from '@angular/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import * as EXIF from 'exif-js';
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
import { EnvService } from '../env.service';

export interface ImageDataInterface {
  src: string | any;
  name: string;
  blob?: Blob;
  file: File | any
}

@Component({
  selector: 'app-advertisement-page',
  templateUrl: './advertisement-page.component.html',
  styleUrls: ['./advertisement-page.component.scss']
})
export class AdvertisementPageComponent implements OnInit{
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
  @ViewChild('mainImage') mainImg: ElementRef
  @ViewChild('mainResizer') mainResizer: ElementRef
   advertId: string = "1";
   useRotate: boolean = false;
  constructor(
    private router: Router,
    private authService: AuthService,
    private mainService: MainService,
    public storageService: StorageService,
    private categoriesService: CategoriesService,
    private commonStore : CommonService,
    private env: EnvService
  ) { 
    this.loadingMini = this.loadingImage = this.commonStore.loadingLittleRedSpinner;
    this.loadingSpinner = this.commonStore.loadingImageSpinner;
    this.apiRoot = this.env.apiUrl;
  }

  ngOnInit() {
    this.useRotate = (/Android/i.test(navigator.userAgent)) ? false : true;
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
        this.showSpinner = false;
        this.categoriesService.fetchCategoriesAll(this.cust_id,null,this.advertId);
      }, error=>alert(error.error.message)
    )
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

  redraw(element: ImageDataInterface, angle: number, image_id?: number) {
    console.log(element)
    if(image_id == -1)
    this.mainResizer.nativeElement.style.display = "none";
    const image: HTMLImageElement = new Image();
    image.src = this.loadingSpinner;
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
      const isMainLogoRotate = image_id == -1
      const name = isMainLogoRotate ? this.mainImageData.file.name : this.additionalImagesData[image_id].file.name ;
      const type = isMainLogoRotate ? this.mainImageData.file.type : this.additionalImagesData[image_id].file.type ;
      fetch(element.src).then(res => res.blob()).then(blob => {
      //  const file = new File([blob], name, {type})
        const file = {name, file: blob}
        isMainLogoRotate ? this.mainFileSelected(file, true) : this.additionalImagesChange(file, image_id, true);
      });
    };
    image.src = element.src;
  }

  removeAdditionalImage(index: number) {
    this.additionalImagesData.splice(index, 1);
  }

  Validators(el){
  //  this.itemName = el.txt
    this.form.controls['Categories'].setValue(el.txt)
  }
  selectedFile: File = null;
  mainFileSelected(event, isTurning: boolean = false){
    const file = this.selectedFile = isTurning ? event : <File>event.target.files[0];
    if(this.mainImageData.name){
      this.uploadedImageStatuses.delete(this.mainImageData.name);
      document.getElementById(this.mainImageData.name).style.display = "block";
    }else{
      this.mainImg.nativeElement.style.display = "block";
    }
    this.mainImageData.src = this.loadingSpinner;
    this.uploadStatus = true;
    setTimeout(()=>{
      this.loadFile(file, (src, name) => {
        this.mainImageData = {src, name: name.replace(/(\.[\w\d_-]+)$/i, `${Math.round(Math.random() * 100)}$1`), file}
        this.uploadStatus = false;
        if(this.useRotate)
          this.setImgOrientation(this.mainImageData).then(result => this.uploadImages(result))
        else
          this.redrawAndUpload(this.mainImageData,0);
      //  this.redrawAndUpload(this.mainImageData,0);
        this.isDisabled = false
      })
    },500)
  }

  redrawAndUpload(element: ImageDataInterface, angle: number) {
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
        element.file = blob;
      });
      element.src = canvas.toDataURL();
      this.uploadImages(element);
    };
    image.src = element.src;
  }

  setImgOrientation(img) {
    return new Promise((resolve, reject) => {
      const that = this;
      EXIF.getData(img.file, function () {
          if (this && this.exifdata && this.exifdata.Orientation) {
            that.resetOrientation(img.src, this.exifdata.Orientation, function 
            (resetBase64Image,blob) {
              img.src = resetBase64Image;
                img.file = blob;
                resolve(img);
            });
          } else{
            that.resetOrientation(img.src, this.exifdata.Orientation, function 
              (resetBase64Image,blob) {
                img.src = resetBase64Image;
                  img.file = blob;
                  resolve(img);
              });
          } 
      });
    });
  }

  resetOrientation(srcBase64, srcOrientation, callback) {
    const img = new Image();
    img.onload = function () {
    const width = img.width,
      height = img.height,
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');
    if (srcOrientation === 6) {
      canvas.width = height;
      canvas.height = width;
      ctx.transform(0, 1, -1, 0, height, 1);
      ctx.drawImage(img, 1, 1);
      canvas.toBlob(function(blob) {
        callback(canvas.toDataURL(),blob);
      });
    } else {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 1, 1)
      canvas.toBlob(function(blob) {
        callback(canvas.toDataURL(),blob);
      });
    //  ctx.transform(0, 1, -1, 0, height, 1);
    }
  };
    img.src = srcBase64;
  }

  selectedFiles: File = null;
  additionalImagesAdd(event){
    this.uploadStatus = true;
    this.additionalImagesData.push({
      src: this.loadingSpinner,
      name: null,
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
          this.additionalImagesData[this.additionalImagesData.length - 1] = item;
        //  this.uploadImages(item);
        //  this.redrawAndUpload(item,0);
        if(this.useRotate)
          this.setImgOrientation(item).then(result => this.uploadImages(result));
          else
            this.redrawAndUpload(item,0);
        this.uploadStatus = false;
      });
    }, 500)
  }

  additionalImagesChange(event, index,isTurning: boolean = false){
    this.showSpinner = true;
    if(this.additionalImagesData[index].name){
      this.uploadedImageStatuses.delete(this.additionalImagesData[index].name);
      document.getElementById(this.additionalImagesData[index].name).style.display = "block";
    }
    this.additionalImagesData[index] = {
      src: this.loadingSpinner,
      name: null,
      file: null
    };
    const file = isTurning? event : <File>event.target.files[0];
    setTimeout(()=>{
      this.loadFile(file, (src, name) => {
        const item = this.additionalImagesData[index];
        item.src = src;
        item.name = name.replace(/(\.[\w\d_-]+)$/i, `${Math.round(Math.random() * 100)}$1`);
        item.file = file;
        this.showSpinner = false;
        if(this.useRotate)
          this.setImgOrientation(item).then(result => this.uploadImages(result))
          else
            this.redrawAndUpload(item,0);
      //  this.redrawAndUpload(item,0);
      });
    }, 500);
  };

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
  //  this.itemName = Ctlg_Name
    this.form.controls['Categories'].setValue(Ctlg_Name)
    this.isDisabled = true;
    this.mainResizer.nativeElement.display = "none";
    this.mainImageData = {
      src: '',
      name: '',
      blob: null,
      file: null
    }
    this.additionalImagesData = []
  }

  countAdditionalImgs: number = 0;
  onSubmit() {
    this.showMessage('Идет публикация ', 'primary',false,true,false);
    this.submitButton.nativeElement.disabled = true;
    let intervalChecker = setInterval(()=>{
      if(this._imageNotLoaded.value == false){
        this.sendData();
        clearInterval(intervalChecker);
      }
    },1000);
  }

  sendData(){
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
                    if(this.additionalImagesData.length == 0){
                      this.successAddedProduct(this.data_form.Ctlg_Name)
                    }
                  })
          }else{
            alert("isCanPromo is false")
          }   
  }
  uploadedImageStatuses = new Map();
  showStatus(name,loaded,total){
    const percent = Math.ceil(loaded / total * 100);
    const element = document.getElementById(name);
    if(element)
      (element as any).value = percent
  }

  dataURIToBlob(dataURI) {
    dataURI = dataURI.replace(/^data:/, '');

    const type = dataURI.match(/image\/[^;]+/);
    const base64 = dataURI.replace(/^[^,]+,/, '');
    const arrayBuffer = new ArrayBuffer(base64.length);
    const typedArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < base64.length; i++) {
        typedArray[i] = base64.charCodeAt(i);
    }

    return new Blob([arrayBuffer], {type});
}
  uploadImages(additionalImagesData){
    const name = additionalImagesData.name;
    const formData = new FormData();
    console.log(additionalImagesData.file)
    formData.append('AppCode', this.cust_id)
    formData.append('Img', additionalImagesData.file)
    formData.append('TImageprev', name)
    this.uploadedImageStatuses.set(name,false);
    this._imageNotLoaded.next(true)
    this.mainService.uploadImageXHR(formData,name,this.showStatus).subscribe(() => {
      this.uploadedImageStatuses.set(name,true);
      const element = document.getElementById(name);
      const rotateElement = document.getElementById(`rotate_${name}`)
      if(rotateElement){
        rotateElement.style.display = "none";
      }
      if(element){
        element.style.display = "none";
        if(rotateElement){
          rotateElement.style.display = "block";
        }
      }
      this._imageNotLoaded.next(!Array.from(this.uploadedImageStatuses.values()).every(obj=>obj))
    });
  }

  categorySelect(items: CategoryItem[]) {
    this.categories = items
    let item = items[items.length - 1]
  //  this.itemName = item.txt
    this.form.controls['Categories'].setValue(item.txt)
    this.idCategory = item.id
    this.showCatalog = false
  }

  breadcrumbsClick() {
    this.categories = []
  //  this.itemName = ''
    this.form.controls['Categories'].setValue('');
    this.idCategory = ''
    this.showCatalog = true
  }

  private isCabinet(): boolean {
    return window.location.pathname.includes('cabinet')
  }

  onCategoriesClick(items: CategoryItem[]) {
    this.storageService.setCategories(items)
    this.mainService.saveCategoriesToStorage(items)
  }

}
