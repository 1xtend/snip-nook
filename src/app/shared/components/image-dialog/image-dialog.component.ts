import { Component, OnInit, inject } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [],
  templateUrl: './image-dialog.component.html',
  styleUrl: './image-dialog.component.scss',
})
export class ImageDialogComponent implements OnInit {
  private dialogConfig = inject(DynamicDialogConfig);
  src: string | null | undefined = null;
  alt: string | null | undefined = null;

  ngOnInit(): void {
    this.src = this.dialogConfig.data.src;
    this.alt = this.dialogConfig.data.alt;
  }
}
