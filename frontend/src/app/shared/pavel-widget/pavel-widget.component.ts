import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PavelWidget } from 'pavel-widget';

@Component({
  selector: 'app-pavel-widget',
  standalone: true,
  template: `<div #host></div>`,
  styleUrl: './pavel-widget.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PavelWidgetComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true })
  private readonly host!: ElementRef<HTMLDivElement>;

  private reactRoot: Root | null = null;

  ngAfterViewInit(): void {
    this.reactRoot = createRoot(this.host.nativeElement);
    this.reactRoot.render(
      React.createElement(PavelWidget, {
        className: 'conduit-pavel-widget',
        position: 'bottom-right',
        text: 'Pavel was here :)',
      }),
    );
  }

  ngOnDestroy(): void {
    this.reactRoot?.unmount();
    this.reactRoot = null;
  }
}
