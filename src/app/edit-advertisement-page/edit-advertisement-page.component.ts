import {Component, OnInit} from '@angular/core';
import {Headers} from '@angular/http';
import {FormControl, FormGroup} from '@angular/forms';
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

  cust_id;
  fio
  userName
  phone

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private mainService: MainService
  ) {
    this.is_edit = true;
  }

  ngOnInit() {

    this.fio = localStorage.getItem('fio')
    this.userName = localStorage.getItem('userName')
    this.phone = localStorage.getItem('phone')
    this.apiRoot = environment.api
    this.id = this.route.snapshot.params['id']
    this.prc_ID = this.route.snapshot.params['idProduct']

    this.form = new FormGroup({
      'TArticle': new FormControl(null),
      'TName': new FormControl(null),
      'TDescription': new FormControl(null),
      'TCost': new FormControl(null),
      'TImageprev': new FormControl(null),
      'TypeProd': new FormControl(null),
      'PrcNt': new FormControl(null),
      'TransformMech': new FormControl(null),
      'Ctlg_Name': new FormControl(null),
      'youtube': new FormControl(null)
    })

    this.mainService.getShopInfo().subscribe(res => {
      this.AppCode = res.cust_id
      this.mainService.getProduct(this.route.snapshot.params['idProduct'], localStorage.getItem('userId'), res.cust_id)
      .subscribe( (res: any) => {
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

  private showMessage( text: string, type:string = 'danger'){
    this.message = new Message(type, text)
    window.setTimeout(() => {
      this.message.text = ''
      if(this.message.type == 'success'){
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

  onFilesMultipleSelected(event, i){
    this.selectedFiles = <File>event.target.files[0]
    var reader = new FileReader()
    reader.onload = (event: any) => {
      this.urls[i] = event.target.result    }
    reader.readAsDataURL(this.selectedFiles)
    this.formDataImages = new FormData()
    this.imageIndex = i
    this.imageName = this.selectedFiles.name.split('.')[0] + i + '.' + this.selectedFiles.name.split('.')[1]
    this.mainService.getShopInfo().subscribe(res => {
      this.formDataImages.append('AppCode', res.cust_id)
      this.formDataImages.append('Img', this.selectedFiles)
      this.formDataImages.append('TImageprev', this.imageName)

      this.mainService.uploadImage(this.formDataImages).subscribe()
    })
    this.imageIndexList.push(this.imageIndex)
    this.filesImg.push(this.imageName)
  }

  deleteImages(url, i){
    console.log("deleteImages");
    this.showSpinner = true
    if(this.filesImg.length != 0){
      this.filesImg.splice(this.urlsImages.indexOf(this.filesImg[i]), 1)
      this.urls.splice(this.urls.indexOf(url), 1)
      this.showSpinner = false
    }
    else{
      this.mainService.getShopInfo().subscribe(res => {
        // this.mainService.deleteProduct(
        //     {
        //       "Cust_ID": this.user.userId,
        //       "Prc_ID": this.route.snapshot.params['idProduct'],
        //       "ImageOrder": this.urlsImages[i].imageOrder,
        //       "AppCode": res.cust_id,
        //       "Cid": localStorage.getItem('userId')
        //     }
        //   )
        // .subscribe(
        //   (res: any) => {
        //     if(res.result == true){
        //       this.urlsImages.splice(this.urlsImages.indexOf(this.urlsImages[i]), 1);
        //       this.urls.splice(this.urls.indexOf(url), 1);
        //       this.showSpinner = false;

        //     }
        //   })
      })
    }
  }

  onSubmit(){

    this.showSpinner = true
    const formData = this.form.value
    this.mainService.getShopInfo().subscribe(res => {
      this.cust_id = res.cust_id
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

      let authorization = 'Bearer ' + localStorage.getItem('token');

      const headers = new Headers({
        'Content-Type': 'application/json; charset=utf8',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      })
      this.mainService.getUserInfo(headers)
      .subscribe(
        (res: any) => {
          if(res.isCanPromo == true){
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
                          this.showMessage( 'Объявления не было отредактировано', 'danger')
                        }
                      },
                      (error) => {
                        this.showSpinner = false
                        this.showMessage( error, 'danger')
                      }
                    )
                  }
                  else{
                    this.showMessage( 'Объявления не было отредактировано', 'danger')
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
            this.showMessage( 'Объявления не было отредактировано', 'danger')
          }
        },
        (error) => {
          this.showMessage( error, 'danger')
        }
      )
    })
  }
}
