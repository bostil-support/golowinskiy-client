import {Component, OnInit} from '@angular/core';
import {Headers} from '@angular/http';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {environment} from 'src/environments/environment';
import {Message} from 'src/app/shared/models/message.model';
import {AuthService} from 'src/app/shared/services/auth.service';
import {MainService} from '../shared/services/main.service';

@Component({
  selector: 'app-edit-advertisement-page',
  templateUrl: './edit-advertisement-page.component.html',
  styleUrls: ['./edit-advertisement-page.component.scss']
})
export class EditAdvertisementPageComponent implements OnInit {
  AppCode: any;
  urlsImages = [];
  imageIndexList = [];
  imageIndex: any;
  data_form: any;
  showPhone: boolean = false;

  form: FormGroup;
  message: Message;

  showModal: boolean = true;

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

  srcImg = '';
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

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private mainService: MainService
  ) {
    this.is_edit = true;
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
        this.srcImg = `${environment.api}Img?AppCode=${this.AppCode}&ImgFileName=${res.t_imageprev}`
        this.srcImgName = res.t_imageprev
        this.element = res
        this.Ctlg_Name = res.ctlg_Name
        this.article = res.ctlg_No
        this.idCategorie = res.id
        this.TName = res.tName
        this.TDescription =res.tDescription
        this.TCost = res.prc_Br
        this.youtube = res.youtube

        if(res.additionalImages != 0){
          for(let i in res.additionalImages){
            this.urls[i] = `${environment.api}Img?AppCode=${this.AppCode}&ImgFileName=${res.additionalImages[i].t_image}`;
            this.urlsImages.push(res.additionalImages[i]);
          }
        }
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

  private showMessage( text: string, type:string = 'danger',redirect: boolean = true){
    this.message = new Message(type, text)
    window.setTimeout(() => {
      this.message.text = ''
      if(this.message.type == 'success' && redirect){
        this.router.navigate(['/cabinet/categories', this.route.snapshot.params['id'], 'products', this.route.snapshot.params['idProduct']])
      }
    }, 2000)
  }

  onFileSelected(event){
    this.selectedFile = <File>event.target.files[0]
    var reader = new FileReader()
    reader.onload = (event: any) => {
      this.srcImg = event.target.result
      this.uploadImg = false
    }
    reader.readAsDataURL(this.selectedFile)
  }
/*
  onFilesMultipleSelectedAdd(event, i){
    this.selectedFiles = <File>event.target.files[0]
    var reader = new FileReader()
    reader.onload = (event: any) => {
      this.urls[this.urls.length] = event.target.result
    }
    reader.readAsDataURL(this.selectedFiles)
    this.formDataImages = new FormData()
    this.imageIndex = this.urls.length
    this.imageName = this.selectedFiles.name.split('.')[0] + this.urls.length + '.' + this.selectedFiles.name.split('.')[1]
    this.mainService.getShopInfo().subscribe(res => {
      this.formDataImages.append('AppCode', res.cust_id)
      this.formDataImages.append('Img', this.selectedFiles)
      this.formDataImages.append('TImageprev', this.imageName)

      this.mainService.uploadImage(this.formDataImages).subscribe()
    })
    this.imageIndexList.push(this.imageIndex)
    this.filesImg.push(this.imageName)
  }
*/
arrayOfAdditionalImages = new Array<FormData>();
  onFilesMultipleSelected(event, i){
    this.selectedFiles = <File>event.target.files[0]
    var reader = new FileReader()
    reader.onload = (event: any) => {
      i ? this.urls[i] = event.target.result : this.urls[this.urls.length] = event.target.result
    }
    reader.readAsDataURL(this.selectedFiles)
    this.formDataImages = new FormData()
    this.imageIndex = i ? i : this.urls.length;
    this.imageName = this.selectedFiles.name.split('.')[0] + i + '.' + this.selectedFiles.name.split('.')[1]
      this.formDataImages.append('AppCode', this.AppCode)
      this.formDataImages.append('Img', this.selectedFiles)
      this.formDataImages.append('TImageprev', this.imageName)
      this.arrayOfAdditionalImages.push(this.formDataImages);
    //  this.mainService.uploadImage(this.formDataImages).subscribe()
    this.imageIndexList.push(this.imageIndex)
    this.filesImg.push(this.imageName)
  }

  deleteImages(url, i){
     const preparedObj = {
      "cust_ID": environment.idPortal,
      "Prc_ID": this.route.snapshot.params['idProduct'],
      "ImageOrder": i,
      "appCode": environment.idPortal,
      "cid": localStorage.getItem('userId')
     }
     this.showSpinner = true;
     this.mainService.deleteAdditionalImg(JSON.stringify(preparedObj)).subscribe((res: {result: boolean})=>{
       this.showSpinner = false;
       if(res.result){
        const index = this.urls.indexOf(url);
        if (index !== -1) this.urls.splice(index, 1);
       }
     }, 
     err=>{
        this.showSpinner = false;
        console.error(err);
        alert('cant delete additional image');
     });
  }

  countAdditionalImgs: number = 0;
  async uploadAdditionalImages(){
    return new Promise((resolve, reject)=>{
      this.mainService.uploadImagesArray(this.arrayOfAdditionalImages)
      .subscribe(
        () => {
          this.countAdditionalImgs +=1;
          if(this.countAdditionalImgs == this.arrayOfAdditionalImages.length)
            resolve(true);
        },
        (error) => {
          this.showMessage(error, 'danger',false)
          reject(false)
        }
      );
    })
  }
  async onSubmit(){
    this.showSpinner = true;
    if(this.arrayOfAdditionalImages.length > 0){
      this.showMessage('Загрузка изображений...', 'primary',false);
      await this.uploadAdditionalImages();
      this.showMessage('Изображения обновлены!', 'success',false);
    }
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
                        this.mainService.editAdditionalImg(this.dataAddImg)
                        .subscribe(
                          (res) => {
                            this.showSpinner = false
                            this.showMessage('Объявления было успешно отредактировано', 'success')
                        })
                      }
                    }
                    else{
                      this.showSpinner = false
                      this.showMessage('Объявления было успешно отредактировано', 'success')
                    }
                  }
                  else{
                    this.showMessage( 'Объявления не было отредактировано', 'danger');
                  }
                },
                (error) => {
                  this.showSpinner = false
                  this.showMessage( error, 'danger')
                }
              )
            }
            else{
              this.mainService.uploadImage(this.dataForm)
              .subscribe(
                (res: any) => {
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
                              this.mainService.editAdditionalImg(this.dataAddImg)
                              .subscribe(
                                (res) => {
                                  this.showSpinner = false
                                  this.showMessage('Объявление было успешно отредактировано', 'success')
                              })
                            }
                          }
                          else{
                            this.showSpinner = false
                            this.showMessage('Объявление было успешно отредактировано', 'success')
                          }
                        }
                        else{
                          this.showMessage( 'Объявление не было отредактировано', 'danger')
                        }
                      },
                      (error) => {
                        this.showSpinner = false
                        this.showMessage( error, 'danger')
                      }
                    )
                  }
                  else{
                    this.showMessage( 'Объявление не было отредактировано', 'danger')
                  }
                },
                (error) => {
                  this.showSpinner = false
                  this.showMessage( error, 'danger')
                }
              )
            }
          }
          else{
            this.showMessage( 'Объявление не было отредактировано', 'danger')
          }
  }

}
