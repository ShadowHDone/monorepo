import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../core/services';

@Component({
  selector: 'app-downloader',
  templateUrl: './downloader.component.html',
  styleUrls: ['./downloader.component.scss'],
})
export class DownloaderComponent implements OnInit {
  fileList$ = this.electronService.currentDirectoryList;
  curDir$ = this.electronService.currentDirectory;

  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {}
}
