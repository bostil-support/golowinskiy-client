import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../services/http.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  selectedFile: File;
  fileName: string;
  productName: string;

  @ViewChild('image') imagePreview: HTMLImageElement;
  imageSrc: string;
  imageBlob: Blob;
  image: HTMLImageElement;
  angle = 90;

  constructor(private httpService: HttpService) { }

  ngOnInit() {
  }

  async loadFile(files: File[]) {
    this.selectedFile = files[0];
    this.fileName = this.selectedFile.name;
    const reader = new FileReader();

    reader.onload = (): string => {
      return reader.result.toString();
    };
    reader.readAsDataURL(files[0]);
    return await reader.onload;
  }

  async addMainImage(files: File[]) {
    const test = this.loadFile(files);
    console.log(test);
  }

  addAdditionalImage(files: File[]) {
    this.loadFile(files);
  }

  redraw(src: string) {
    console.log(this.angle);
    const image: HTMLImageElement = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      if (this.angle % 180 !== 0) {
        canvas.width = image.naturalHeight;
        canvas.height = image.naturalWidth;
      } else {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
      }
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(this.angle * Math.PI / 180);
      context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
      context.restore();
      canvas.toBlob((blob: Blob) => {
        this.imageBlob = blob;
      });
      this.imageSrc = canvas.toDataURL();
    };
    image.src = src;
  }

  productCreate() {
    this.httpService.imageUpload(this.imageBlob, this.fileName)
      .subscribe(() => this.httpService.productCreate(this.fileName, this.productName));
  }

  rotateImage(angle: number) {
    this.angle += angle;
    this.redraw(this.imageSrc);
  }
}
