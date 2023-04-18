import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {RcvService, SearchVO} from './rcv.service';
import {DxFormComponent} from "devextreme-angular/ui/form";
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from "devextreme-angular";
import {CommonCodeService} from "../../../shared/services/common-code.service";
import {RcvCommonUtils} from "../rcvCommonUtils";
import DataSource from "devextreme/data/data_source";
import {GridUtilService} from '../../../shared/services/grid-util.service';
import ArrayStore from "devextreme/data/array_store";
import {RcvexpectedService} from "../rcvexpected/rcvexpected.service";



@Component({
  selector: 'app-rcv',
  templateUrl: './rcv.component.html',
  styleUrls: ['./rcv.component.scss']
})

export class RcvComponent implements OnInit, AfterViewInit {
  mainFormData: SearchVO = {} as SearchVO;
  G_TENANT: any;
  dsRcvStatus =[];
  dsRcvType = [];
  dsSupplier = [];
  dsWarehouse = [];
  dsOwner = [];
  entityStore: ArrayStore;
  mainDataSource: DataSource;
  dataSource: DataSource;
  key = 'uid';
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;



  GRID_STATE_KEY = 'rcv_rcv';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  constructor(public utilService: CommonUtilService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private service: RcvService,
              ){}
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    // this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
    this.initData(this.mainForm);
  }
  initForm(): void {

    this.mainForm.instance.getEditor('sts').option('value', RcvCommonUtils.STS_IDLE); // 예정
  }

  ngOnInit(): void {
    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.dataSource = new DataSource({
      store: this.entityStore
    });

    this.G_TENANT = this.utilService.getTenant();
    this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
      this.dsRcvStatus = result.data;
    });
    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });
    this.codeService.getCompany(this.G_TENANT, null, true, true,  true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouse = result.data;
      this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    });
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
      this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    });
  }
  initData(form): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromRcvSchDate.value = rangeDate.fromDate;
    this.toRcvSchDate.value = rangeDate.toDate;

    form.formData = {
      tenant: this.G_TENANT,
      // sts: '100',
      fromRcvSchDate: rangeDate.fromDate,
      toRcvSchDate: rangeDate.toDate,
      // warehouseId: this.utilService.getCommonWarehouseId(),
      // ownerId: this.utilService.getCommonOwnerId()
    };
  }

  onReset() {

  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    console.log(this.mainForm.formData);

    this.codeService.getCompany(this.G_TENANT, null, true, true, true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    if (data.isValid) {

      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.fromReceiveDate = document.getElementsByName('fromReceiveDate').item(1).getAttribute('value');
      this.mainFormData.toReceiveDate = document.getElementsByName('toReceiveDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }
  async onNew(e): Promise<void> {
    // this.deleteBtn.visible = false;
    // this.showPopup('Add', {...e.data});
  }
}
