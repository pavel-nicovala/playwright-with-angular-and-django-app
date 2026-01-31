import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PavelWidget } from 'pavel-widget';

@Component({
  selector: 'app-pavel-widget',
  standalone: true,
  template: `<div #host></div>`,
})
export class PavelWidgetComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true })
  private readonly host!: ElementRef<HTMLDivElement>;

  private reactRoot: Root | null = null;

  ngAfterViewInit(): void {
    this.reactRoot = createRoot(this.host.nativeElement);
    this.reactRoot.render(React.createElement(PavelWidget));
  }

  ngOnDestroy(): void {
    this.reactRoot?.unmount();
    this.reactRoot = null;
  }
}
