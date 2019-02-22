import {Component, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {HttpService} from '../../services/http.service';

export interface ImageDataInterface {
  src: string;
  name: string;
  blob: Blob;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  fileName: string;
  productName: string;

  @ViewChild('image') imagePreview: HTMLImageElement;
  mainImageData: ImageDataInterface = {
    src: '',
    name: '',
    blob: null,
  };

  @ViewChildren('additionalImages') additionalImages: HTMLImageElement[];
  additionalImagesData: ImageDataInterface[] = [];

  constructor(private httpService: HttpService) { }

  ngOnInit() {
  }

  loadFile(files: File[], callback: (src: string, name: string) => any) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => callback(reader.result.toString(), file.name);
    reader.readAsDataURL(file);
  }

  addMainImage(files: File[]) {
    this.loadFile(files, (src, name) => {
      this.mainImageData.src = src;
      this.mainImageData.name = name;
    });
  }

  addAdditionalImage(files: File[]) {
    this.loadFile(files, ((src, name) => this.additionalImagesData.push({
      src,
      name,
      blob: null
    })));
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
      console.log(image.naturalWidth, image.naturalHeight);
      context.restore();
      canvas.toBlob((blob: Blob) => {
        element.blob = blob;
      });
      element.src = canvas.toDataURL();
      canvas.parentNode.removeChild(canvas);
    };
    image.src = element.src;
  }

  removeAdditionalImage(item: ImageDataInterface) {
    const index = this.additionalImagesData.indexOf(item);
    this.additionalImagesData.splice(index, 1);
  }

  removeMainImage() {
    this.mainImageData = {
      src: '',
      name: '',
      blob: null,
    };
  }

  productCreate() {
    this.httpService.imageUpload(this.mainImageData)
      .subscribe(() => this.httpService.productCreate(this.fileName, this.productName));
  }
}
