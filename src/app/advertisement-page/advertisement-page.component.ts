import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from 'src/environments/environment';
import { Message } from 'src/app/shared/models/message.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MainService } from '../shared/services/main.service';

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
  dataForm: any
  data_form: any
  formDataImages: any
  srcImg = ''
  selectedFile: File = null
  selectedFiles: File = null
  files: any
  urls = []
  dataAddImg
  filesImg = []
  imageIndexList = []
  imageIndex: any
  imageName: string

  message: Message

  showValidators = false
  showSpinner = true
  uploadImg = true
  isDisabled = true 


  idCategorie
  itemName = ''  

  @ViewChild('submitButton') submitButton: ElementRef

  constructor( 
    private router: Router,
    private authService: AuthService,
    private mainService: MainService
  ) { }

  private showMessage( text: string, type:string = 'danger'){
    this.message = new Message(type, text)
    window.setTimeout(() => {
      this.message.text = ''
      if(this.message.type == 'success'){
        this.router.navigate(['/addProduct'])       
      }      
    }, 2000)
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
    this.mainService.getShopInfo().subscribe(
      (res) => {
        this.showSpinner = false
      }
    ) 
  }

  Validators(el){
    this.itemName = el.txt
  }
  
  onFileSelected(event){
    this.selectedFile = <File>event.target.files[0]     
    var reader = new FileReader()      
    reader.onload = (event: any) => {      
      this.srcImg = event.target.result
      this.uploadImg = false
    }
    reader.readAsDataURL(this.selectedFile)
    this.isDisabled = false
  }

  uploadImages(){
    this.formDataImages = new FormData()
    this.mainService.getShopInfo().subscribe(res => { 
      this.formDataImages.append('AppCode', res.cust_id)
      this.formDataImages.append('Img', this.selectedFiles)
      this.formDataImages.append('TImageprev', this.imageName) 
      this.mainService.uploadImage(this.formDataImages).subscribe()
    })
  }

  onFilesMultipleSelectedAdd(event){
    this.selectedFiles = <File>event.target.files[0]
    var reader = new FileReader()                
    reader.onload = (event: any) => { 
      this.urls[this.urls.length] = event.target.result     
    }   
    reader.readAsDataURL(this.selectedFiles);    
    this.imageIndex = this.urls.length
    this.imageName = this.selectedFiles.name.split('.')[0] + this.urls.length + '.' + this.selectedFiles.name.split('.')[1]
    this.uploadImages()
    this.imageIndexList.push(this.imageIndex)
    this.filesImg.push(this.imageName)    
  }

  onFilesMultipleSelected(event){ 

    this.selectedFiles = <File>event.target.files[0]
    this.files = event.target.files
    if (this.files) {
      for (let file of this.files) {
        let reader = new FileReader()
        reader.onload = (e: any) => {          
          this.urls.push(e.target.result)
        }
        reader.readAsDataURL(file)
        this.imageName = this.selectedFiles.name.split('.')[0] + this.urls.length + '.' + this.selectedFiles.name.split('.')[1]
        this.uploadImages()
        this.filesImg.push(this.imageName)
      }
    }  
  }

  mouseOverButton(){
    if(this.form.invalid){
      this.showValidators = true
    }
    else{
      this.showValidators = false
    }
  }
  mouseLeaveButton(){    
    this.showValidators = false
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

  reset() {
    this.createForm()
  }

  successAddedProduct(Ctlg_Name){
    this.uploadImg = true
    this.showSpinner = false
    this.showMessage('Объявление было успешно размещено', 'success')
    this.srcImg = ''
    this.urls = []   
    this.srcImg = ''
    this.reset()      
    this.itemName = Ctlg_Name
    this.isDisabled = true
    this.filesImg = []
  }
  
  onSubmit(){ 
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf8',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    })
    this.showSpinner = true
    this.submitButton.nativeElement.disabled = true
    const formData = this.form.value    
    this.mainService.getShopInfo().subscribe(res => { 
      this.cust_id = res.cust_id    
      if(this.selectedFile == null){
        this.data_form = {
          "Catalog": res.cust_id,      //nomer catalog
          "Id": null,         // post categories/
          "Ctlg_Name": formData.Categories,     //input form
          "TArticle": formData.Article, //input form
          "TName": formData.TName, //input form
          "TDescription": formData.TDescription, //input form
          "TCost": formData.TCost, //input form
          "Appcode": res.cust_id,  
          "TypeProd": formData.TypeProd, //input form
          "PrcNt": formData.PrcNt, //input form
          "TransformMech": formData.TransformMech,  //input form    
          "CID": this.userId, // userId for auth,
          "video": formData.youtube
        }
      }
      else{
        this.data_form = {
          "Catalog": res.cust_id,      //nomer catalog
          "Id": null,         // post categories/
          "Ctlg_Name": formData.Categories,     //input form
          "TArticle": formData.Article, //input form
          "TName": formData.TName, //input form
          "TDescription": formData.TDescription, //input form
          "TCost": formData.TCost, //input form
          "TImageprev": this.selectedFile.name, // input form   
          "Appcode": res.cust_id,  
          "TypeProd": formData.TypeProd, //input form
          "PrcNt": formData.PrcNt, //input form
          "TransformMech": formData.TransformMech,  //input form    
          "CID": this.userId, // userId for auth
          "video": formData.youtube
        }
        this.dataForm = new FormData()
        this.dataForm.append('AppCode', res.cust_id)
        this.dataForm.append('Img', this.selectedFile)
        this.dataForm.append('TImageprev', this.selectedFile.name)         
      }        
      this.mainService.getUserInfo(headers).subscribe(        
        (res: any) => {               
          this.Validators(this.data_form.Ctlg_Name)                    
          if(res.isCanPromo == true){                
            if(this.selectedFile == null){
              this.mainService.addProduct(this.data_form, headers)                  
              .subscribe(
                (res: any) => { 
                  if(res.result == "1"){ 
                    if(this.filesImg.length != 0){
                      for (let i in this.filesImg) { 
                        this.dataAddImg = {
                          "catalog": this.cust_id,
                          "id": this.idCategorie,
                          "prc_ID": res.prc_id,
                          "imageOrder": i,
                          "tImage": this.filesImg[i],
                          "appcode": this.cust_id,
                          "cid": this.userId
                        }
                        this.mainService.addAdditionalImg(this.dataAddImg, headers)                          
                        .subscribe(
                          (res) => {
                            this.successAddedProduct(this.data_form.Ctlg_Name)
                        })
                      }                        
                    }
                    else{
                      this.successAddedProduct(this.data_form.Ctlg_Name)
                    }
                  }
                  else{ 
                    this.showMessage( 'Объявление не было размещено', 'danger'); 
                  }                  
                },
                (error) => {
                  this.showSpinner = false
                  this.showMessage( 'Объявление не было размещено', 'danger')  
                }
              ) 
            }
            else{
              this.mainService.uploadImage(this.dataForm)
              .subscribe(
                (res: any) => { 
                  if(res.result == true){ 
                    this.mainService.addProduct(this.data_form, headers)                      
                    .subscribe(
                      (res: any) => {         
                        if(res.result == "1"){         
                          if(this.filesImg.length != 0){
                            for (let i in this.filesImg) {
                              this.dataAddImg = {
                                "catalog": this.cust_id,
                                "id": this.idCategorie,
                                "prc_ID": res.prc_id,
                                "imageOrder": i,
                                "tImage": this.filesImg[i],
                                "appcode": this.cust_id,
                                "cid": this.userId
                              }    
                              this.mainService.addAdditionalImg(this.dataAddImg, headers) 
                              .subscribe(
                                (res) => {       
                                  this.successAddedProduct(this.data_form.Ctlg_Name)
                              })
                            }
                          }
                          else{
                            this.successAddedProduct(this.data_form.Ctlg_Name)
                          }
                        }
                        else{
                          this.showMessage( 'Объявление не было размещено', 'danger'); 
                        }                  
                      },
                      (error) => {
                        this.showSpinner = false;        
                        this.showMessage( 'Объявление не было размещено', 'danger'); 
                      }
                    )                   
                  }
                  else{
                    this.showMessage( 'Объявление не было размещено', 'danger'); 
                  }
                },
                (error) => {
                  this.showSpinner = false;
                  this.showMessage( 'Объявление не было размещено', 'danger'); 
                }
              ) 
            }           
          }
          else{
            this.showSpinner = false;
            this.showMessage( 'Объявление не было размещено', 'danger'); 
          }
        },
        (error) => {
          this.showSpinner = false
          this.showMessage( 'Объявление не было размещено', 'danger') 
        }
      )
    })
  } 
}
