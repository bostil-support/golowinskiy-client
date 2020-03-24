import {Component, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {Headers} from '@angular/http';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {environment} from 'src/environments/environment';
import {Message} from 'src/app/shared/models/message.model';
import {AuthService} from 'src/app/shared/services/auth.service';
import {MainService} from '../shared/services/main.service';
import { BehaviorSubject, forkJoin, Observable, Subscription } from 'rxjs';
import { CommonService } from '../shared/services/common.service';

@Component({
  selector: 'app-edit-advertisement-page',
  templateUrl: './edit-advertisement-page.component.html',
  styleUrls: ['./edit-advertisement-page.component.scss']
})
export class EditAdvertisementPageComponent implements OnInit, OnDestroy {
  public _imageNotLoaded = new BehaviorSubject<boolean>(false);
  AppCode: any;
  urlsImages = [];
  imageIndexList = [];
  imageIndex: any;
  data_form: any;
  showPhone: boolean = false;
  loadingImage = "";
  form: FormGroup;
  message: Message;
  loadingSpinner = ""
  showModal: boolean = true;
  additionalImagesArray: any;
  user: any;

  Gallery = [];

  appCode;
  idCategorie;
  Ctlg_Name;
  article;
  prc_ID;
  element = [];
  elGallery = [];

  is_edit: boolean;

  srcImg: any = {file: null, name: null};
  srcAddImg = '';
  selectedFile: File = null;

  TName;
  TDescription;
  TCost;
  youtube;
  id;
  dataForm;
  srcImgName;

  showSpinner: boolean = false;
  uploadImg: boolean = true;

  selectedFiles: File = null;
  files: any;
  urls = [];
  formDataImages: any;
  imageName: string;
  filesImg = [];
  apiRoot;

  urlsAdd = [];
  dataAddImg;
  isCanPromo: boolean = false;
  cust_id;
  fio
  userName
  phone
  progress: any = "d";
  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private mainService: MainService,
    public commonStore: CommonService
  ) {
    this.is_edit = true;
    this.loadingSpinner = this.commonStore.loadingImageSpinner;
    this.loadingImage = this.commonStore.loadingLittleRedSpinner;
    /*
      this.commonStore.addImagesStackUploaded.subscribe((res:any)=> {
        const loaded = Math.round((res / (this.commonStore.addImagesStack.value as any)) * 100)
        this.commonStore.progress.next((Number.isNaN(loaded) ? 0 : loaded) + "%")
      });
      this.commonStore.progress.subscribe(res=>this.progress = (res))
    */
  }

  ngOnInit() {
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf8',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    })
    this.mainService.getUserInfo(headers).subscribe((res: any) => {
      this.isCanPromo = res.isCanPromo;
    });
    this.fio = localStorage.getItem('fio')
    this.userName = localStorage.getItem('userName')
    this.phone = localStorage.getItem('phone')
    this.apiRoot = environment.api
    this.id = this.route.snapshot.params['id']
    this.prc_ID = this.route.snapshot.params['idProduct']
    this.form = this.fb.group({
      TArticle: '',
      TName: '',
      TDescription: '',
      TCost: '',
      TImageprev: '',
      TypeProd: '',
      PrcNt: '',
      TransformMech: '',
      Ctlg_Name: '',
      youtube: '',
    })
    this.showSpinner = true;
    this.mainService.getShopInfo().subscribe(res => {
      this.AppCode = res.cust_id
      this.mainService.getProduct(this.route.snapshot.params['idProduct'], localStorage.getItem('userId'), res.cust_id)
      .subscribe( (res: any) => {
        this.form.setValue({
          TArticle: '',
          TName: res.tName,
          TDescription: res.tDescription,
          TCost: res.prc_Br,
          TImageprev: '',
          TypeProd: '',
          PrcNt: '',
          TransformMech: '',
          Ctlg_Name: res.ctlg_Name,
          youtube: res.youtube,
        });
        this.showSpinner = false;
        this.srcImg = {file:`${environment.api}Img?AppCode=${this.AppCode}&ImgFileName=${res.t_imageprev}`,name:res.t_imageprev};
        this.srcImgName = res.t_imageprev
        this.element = res
        this.Ctlg_Name = res.ctlg_Name
        this.article = res.ctlg_No
        this.idCategorie = res.id
        this.TName = res.tName
        this.TDescription =res.tDescription
        this.TCost = res.prc_Br
        this.youtube = res.youtube;
        this.additionalImagesArray = res.additionalImages;
        if(res.additionalImages != 0){
          for(let i in res.additionalImages){
            this.urls[i] = {file:`${environment.api}Img?AppCode=${this.AppCode}&ImgFileName=${res.additionalImages[i].t_image}`, name:res.additionalImages[i].t_image};
            this.urlsImages.push(res.additionalImages[i]);
          }
        }
        setTimeout(()=>{
          res.additionalImages.forEach(element => {
            if(document.getElementById(element.t_image))
            document.getElementById(element.t_image).style.display = "none";
          });
        });
      })
    })
    this.message = new Message('danger', '')
    if(localStorage.getItem('phone')){
      this.showPhone = true
    }
    else{
      this.showPhone = false
    }

  }

  private showMessage( text: string, type:string = 'danger',redirect: boolean = true,showSpinner: boolean = false,hideMessage: boolean = true){
    this.message = new Message(type, text,showSpinner)
    window.setTimeout(() => {
      if(hideMessage)
      this.message.text = ''
      if(this.message.type == 'success' && redirect){
        this.router.navigate(['/cabinet/categories', this.route.snapshot.params['id'], 'products', this.route.snapshot.params['idProduct']])
      }
    }, 2000)
  }

  onFileSelected(event){
    this.selectedFile = <File>event.target.files[0];
    document.getElementById(this.srcImg.name).style.display = "block";
    if(this.srcImg.name){
      this.uploadedImageStatuses.delete(this.srcImg.name);
    }
    var reader = new FileReader();
    this.srcImg = {
      file: this.loadingSpinner, 
      name: this.selectedFile.name
    };
    reader.onload = (event: any) => {
      this.srcImg = {
        file: event.target.result, 
        name: this.selectedFile.name
      }
      this.srcImgName = this.selectedFile.name;
      this.uploadImages(this.srcImg);
      this.uploadImg = false;
    }
    reader.readAsDataURL(this.selectedFile)
  }

loadFile(files: File, callback: (src: string, name: string) => any) {
  const file = files;
  const reader = new FileReader();
  reader.onload = () => callback(reader.result.toString(), file.name);
  reader.readAsDataURL(file);
}

  arrayOfAdditionalImages = new Array<FormData>();
  sizeCounter: number = 0;
  onFilesMultipleSelected(event, i){
    const previousImgName = i ? this.urls[i].name : '';
    this.selectedFiles = <File>event.target.files[0];
    const name = this.selectedFiles.name.replace(/(\.[\w\d_-]+)$/i, `${Math.round(Math.random() * 100)}$1`);
    this.sizeCounter +=event.target.files[0].size 
    this.commonStore.addImagesStack.next(this.sizeCounter);
    var reader = new FileReader()
    const obj = {file: this.loadingSpinner, name: null}
    Number.isInteger(i) ? this.urls[i] = obj : this.urls.push(obj);
    setTimeout(()=>{
      reader.onload = (event: any) => {
        const obj = {
          file: event.target.result, 
          name}
        Number.isInteger(i) ? this.urls[i] = obj : this.urls[this.urls.length -1] = obj;
        this.imageIndex = Number.isInteger(i) ? this.getImageOrderId(previousImgName) : this.urls.length;
        const preparedObj = {
          file: this.selectedFiles,
          name
        }
        this.imageIndexList.push(this.imageIndex)
        this.filesImg.push(name)
        this.uploadImages(preparedObj);
      }
      reader.readAsDataURL(this.selectedFiles)
    },500)
  }
 
  uploadedImageStatuses = new Map();
  showStatus(name,loaded,total){
    const percent = Math.ceil(loaded / total * 100);
    const element = document.getElementById(name);
    element ? (element as any).value = percent: '';
  }
  uploadImages(additionalImagesData){
    const formData = new FormData();
    formData.append('AppCode', this.AppCode)
    formData.append('Img', additionalImagesData.file)
    formData.append('TImageprev', additionalImagesData.name)
    this.uploadedImageStatuses.set(additionalImagesData.name,false);
    this._imageNotLoaded.next(true)
    this.mainService.uploadImageXHR(formData,additionalImagesData.name,this.showStatus).subscribe(() => {
      this.uploadedImageStatuses.set(additionalImagesData.name,true);
      const element = document.getElementById(additionalImagesData.name);
      if(element)
        element.style.display = "none";
      this._imageNotLoaded.next(!Array.from(this.uploadedImageStatuses.values()).every(obj=>obj))
    });
    console.log(this.uploadedImageStatuses)
  }

  deleteImages(url, i){
    const imgNumber = this.getImageOrderId(url);
    const index = this.urls.indexOf(url);
    if(imgNumber){
      const preparedObj = {
        "cust_ID": this.AppCode,
        "Prc_ID": this.route.snapshot.params['idProduct'],
        "ImageOrder": imgNumber,
        "appCode": this.AppCode,
        "cid": localStorage.getItem('userId')
      }
      this.showSpinner = true;
      this.mainService.deleteAdditionalImg(JSON.stringify(preparedObj)).subscribe((res: {result: boolean})=>{
      this.showSpinner = false;
        if(res.result){
          if (index !== -1) this.urls.splice(index, 1);
        }
      },err=>{
        this.showSpinner = false;
        console.error(err);
        alert('cant delete additional image');
      });
    } else{
      if (index !== -1) this.urls.splice(index, 1);
    }
  }

  getImageOrderId(name){
    const res = this.urlsImages.filter(img => img.t_image == name);
    return res ? res.length !==0 ? res[0].imageOrder : null : null;
  }


  subscriptionImages : Subscription;
  onSubmit(){
    this.showMessage('Идет редактирование ', 'primary',false,true,false);
    this._imageNotLoaded.subscribe((res)=>{
      if(!res){
        const formData = this.form.value
        this.cust_id = this.AppCode;
        if(this.selectedFile == null){
          this.data_form = {
            "Catalog": this.cust_id,      //nomer catalog
            "Id": this.idCategorie,         // post categories/
            "Ctlg_Name": this.Ctlg_Name,     //Ctlg_Name
            "TArticle": this.article, //Article
            "TName": formData.TName, //input form
            "TDescription": formData.TDescription, //input form
            "TCost": formData.TCost, //input form
            "TImageprev": this.srcImgName, // input form
            "Appcode": this.cust_id,     //post Gallery/
            "TypeProd": formData.TypeProd, //input form
            "PrcNt": formData.PrcNt, //input form
            "TransformMech": formData.TransformMech,  //input form
            "CID": localStorage.getItem('userId'), // userId for auth,
            "video": formData.youtube
          };
        }
        else{
          this.data_form = {
            "Catalog": this.cust_id,      //nomer catalog
            "Id": this.idCategorie,         // post categories/
            "Ctlg_Name": this.Ctlg_Name,     //Ctlg_Name
            "TArticle": this.article, //Article
            "TName": formData.TName, //input form
            "TDescription": formData.TDescription, //input form
            "TCost": formData.TCost, //input form
            "TImageprev": this.selectedFile.name, // input form
            "Appcode": this.cust_id,     //post Gallery/
            "TypeProd": formData.TypeProd, //input form
            "PrcNt": formData.PrcNt, //input form
            "TransformMech": formData.TransformMech,  //input form
            "CID": localStorage.getItem('userId'), // userId for auth
            "video": formData.youtube
          }
          this.dataForm = new FormData();
          this.dataForm.append('AppCode', this.cust_id);
          this.dataForm.append('Img', this.selectedFile);
          this.dataForm.append('TImageprev', this.selectedFile.name);
        }
            if(this.isCanPromo){
              if(this.selectedFile == null){
                this.mainService.editProduct(this.data_form)
                .subscribe(
                  (res: any) => {
                    if(res.result == true){
                      if(this.filesImg.length != 0){
                        for (let i in this.imageIndexList) {
                          this.dataAddImg = {
                            "Catalog": this.cust_id,
                            "Id": this.idCategorie,
                            "Prc_ID": this.route.snapshot.params['idProduct'],
                            "ImageOrder": this.imageIndexList[i],
                            "TImage": this.filesImg[i],
                            "Appcode": this.cust_id,
                            "CID": localStorage.getItem('userId')
                          }
                          console.log(this.dataAddImg)
                          this.mainService.editAdditionalImg(this.dataAddImg)
                          .subscribe(
                            () => {
                              this.showMessage('Объявление было успешно отредактировано', 'success')
                          })
                        }
                      }
                      else{
                        this.showMessage('Объявление было успешно отредактировано', 'success')
                      }
                    }
                    else{
                      this.showMessage( 'Объявление не было отредактировано', 'danger');
                    }
                  },
                  (error) => {
                    this.showMessage( error, 'danger')
                  }
                )
              }
              else{
                this.startTimer()
                this.mainService.uploadImage(this.dataForm)
                .subscribe(
                  (res: any) => {
                    this.pauseTimer();
                    if(res.result == true){
                      this.mainService.editProduct(this.data_form)
                      .subscribe(
                        (res: any) => {
                          if(res.result == true){
                            if(this.filesImg.length != 0){
                              for (let i in this.imageIndexList) {
                                this.dataAddImg = {
                                  "Catalog": this.cust_id,
                                  "Id": this.idCategorie,
                                  "Prc_ID": this.route.snapshot.params['idProduct'],
                                  "ImageOrder": this.imageIndexList[i],
                                  "TImage": this.filesImg[i],
                                  "Appcode": this.cust_id,
                                  "CID": localStorage.getItem('userId')
                                }
                                console.log(this.dataAddImg)
                                this.mainService.editAdditionalImg(this.dataAddImg)
                                .subscribe(
                                  (res) => {
                                 //   this.showSpinner = false
                                    this.showMessage('Объявление было успешно отредактировано', 'success')
                                })
                              }
                            }
                            else{
                          //    this.showSpinner = false
                              this.showMessage('Объявление было успешно отредактировано', 'success')
                            }
                          }
                          else{
                            this.showMessage( 'Объявление не было отредактировано', 'danger')
                          }
                        },
                        (error) => {
                      //    this.showSpinner = false
                          this.showMessage( error, 'danger')
                        }
                      )
                    }
                    else{
                      this.showMessage( 'Объявление не было отредактировано', 'danger')
                    }
                  },
                  (error) => {
             //       this.showSpinner = false
                    this.showMessage( error, 'danger')
                  }
                )
              }
            }
            else{
              this.showMessage( 'Объявление не было отредактировано', 'danger')
            }
      }
    });

  }


  ngOnDestroy(){
    console.log("unsubscr")
    this.subscriptionImages.unsubscribe();
  }

  timeLeft: number = 0;
  interval;
  startTimer() {
    this.interval = setInterval(() => {
        this.timeLeft++;
    },1000)
  }
  pauseTimer() {
    clearInterval(this.interval);
    console.log('update image request timer = '+this.timeLeft+' sec.')
  }

  

}
