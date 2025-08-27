import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'padzero',
  standalone: true
})
export class PadzeroPipe implements PipeTransform {

  transform(value: string | number, ...args: any[]): string {
  const num = typeof value === 'string' ? parseInt(value, 10) : value; // Преобразуем строку в число, если значение пришло как строка
  return num.toString().padStart(5, '0'); // Преобразуем число в строку и добавляем ведущие нули до длины 5
  }
}