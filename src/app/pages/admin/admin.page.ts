import { Component } from '@angular/core';
import { UserTableComponent } from '../../components/user-management/user-table/user-table.component';

@Component({
  selector: 'app-admin',
  imports: [UserTableComponent],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss'
})
export class AdminPage {

}
