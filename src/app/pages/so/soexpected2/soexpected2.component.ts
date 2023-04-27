import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {SearchVO, Soexpected2Service} from '../../so/soexpected2/soexpected2.service';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent, DxPopupComponent} from 'devextreme-angular';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-soexpected2',
  templateUrl: './soexpected2.component.html',
  styleUrls: ['./soexpected2.component.scss']
})
export class Soexpected2Component implements OnInit, AfterViewInit {
  mainFormData: SearchVO = {} as SearchVO;
  G_TENANT: any;
  dsSoType = [];
  dsCompany = [];
  dsShipTo = [];
  dsWarehouse = [];
  dsOwner = [];
  dsCountry = [];
  dsActFlg = [];
  dsSoStatus = [];
  dsDeliveryType = [];
  dsPort = [];
  dsYN = [];
  dsDamageFlg = [];
  dsUnit = [];
  dsItemAdmin = [];
  dsAllPort = [];
  // summary
  searchList = [];

  entityStore: ArrayStore;
  mainDataSource: DataSource;
  dataSource: DataSource;
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  selectedRows = [];

  popupVisible = false;
  popupMode = 'Add';
  popupData: SearchVO;

  changes = [];
  key = 'uid';
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;


  GRID_STATE_KEY = 'so_soexpected2';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  dsUser = [];
  dsItemId = [];

  constructor(public utilService: CommonUtilService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private service: Soexpected2Service,
  ) {
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.onNew = this.onNew.bind(this);
    this.isAllowEditing = this.isAllowEditing.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.setIsSerial = this.setIsSerial.bind(this);
    this.onChangedCountry = this.onChangedCountry.bind(this);
    this.onChangedCompany = this.onChangedCompany.bind(this);
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
    this.initData(this.mainForm);
  }

  initForm(): void {


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

    this.codeService.getCode(this.G_TENANT, 'SOSTATUS').subscribe(result => {
      this.dsSoStatus = result.data;
      this.mainForm.instance.getEditor('sts').option('value', '100'); // 예정
    });

    this.codeService.getCompany(this.G_TENANT, null, true, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });
    this.codeService.getCompany(this.G_TENANT, null, null, true, null, null, null, null).subscribe(result => {
      this.dsShipTo = result.data;
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
    this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });
    this.codeService.getCodeOrderByCode(this.G_TENANT, 'SODELIVERYTYPE').subscribe(result => {
      this.dsDeliveryType = result.data;
    });
    this.codeService.getCode(this.G_TENANT, 'SOTYPE').subscribe(result => {
      this.dsSoType = result.data;
    });
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnit = result.data;
    });
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });
    // 항구
    this.codeService.getCode(this.G_TENANT, 'PORT').subscribe(result => {
      this.dsAllPort = result.data;
    });

  }

  initData(form): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromShipSchDate.value = rangeDate.fromDate;
    this.toShipSchDate.value = rangeDate.toDate;

    form.formData = {
      tenant: this.G_TENANT,
      fromShipSchDate: rangeDate.fromDate,
      toShipSchDate: rangeDate.toDate,
    };
  }

  onReset(): void {

  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');
      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;  // 서머리를 위한 변수 / 서머리를 사용하지 않으면 불필요
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

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }


  showPopup(popupMode, data): void {
    // this.popupForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.changes = [];  // 초기화
    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });
    this.popupMode = popupMode;
    this.popupVisible = true;
    if (popupMode !== 'Add') {
      this.popupData = data;
      this.popupData = {tenant: this.G_TENANT, ...this.popupData};
      this.onSearchPopup();
      this.dsPort = this.dsAllPort.filter(el => el.etcColumn1 === data.countrycd);

    }

  }

  isAllowEditing(): boolean {
    // return this.popupData.sts === RcvCommonUtils.STS_IDLE;
    return true;
  }

  async onSearchPopup(): Promise<void> {
    if (this.popupData.uid) {
      // Service의 get 함수 생성
      const result = await this.service.getSoFull(this.popupData);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.popupData = result.data;
        this.popupData = {tenant: this.G_TENANT, ...this.popupData};
        this.popupEntityStore = new ArrayStore(
          {
            data: result.data.soDetailList,
            key: this.key
          }
        );
        this.popupDataSource = new DataSource({
          store: this.popupEntityStore
        });
        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;

      }
    }
  }

  // 추가버튼 이벤트
  addClick(): void {
    // 입고상태가 예정이 아닐 경우 return
    if (this.popupData.sts !== '100') {
      return;
    }
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
    });
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
    // 재조회
    this.onSearch();
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupGrid.instance.cancelEditData();
    this.onSearch();
  }

  popupShown(e): void {
    if (this.popupMode === 'Add') {
      this.popupData.sts = '100';
      this.popupData.deliveryType = 'OUTER';
      this.popupData.shipSchDate = this.utilService.getFormatDate(new Date());
      this.popupData.warehouseId = this.utilService.getCommonWarehouseId();
      this.popupData.logisticsId = this.utilService.getCommonWarehouseVO().logisticsId;
      this.popupData.ownerId = this.utilService.getCommonOwnerId();
      this.popupData.soType = 'RENT';
      this.popupData.actFlg = 'Y';
      this.saveBtn.visible = true;
    }

    if (this.popupData.sts !== '100') {
      this.deleteBtn.visible = false;
      this.saveBtn.visible = false;
    }
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
  }


  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
    this.showPopup('Edit', {...e.data});
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('soTx', '입고전표'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      const deleteContent = this.popupData as SearchVO;
      const result = await this.service.delete(deleteContent);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {
    const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('soTx', '입고전표'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    const rangeDate = this.utilService.getDateRange();
    const selectedDat = this.popupData.shipSchDate;
    const currentDate = rangeDate.toDate;

    if (selectedDat < currentDate) {
      this.utilService.notify_error('Selected date after today');
      return;
    }


    // 상품목록 추가여부
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {
      // '입고상품 목록을 추가하세요.'
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert('rcvExpect_popupGridTitle'));
      this.utilService.notify_error(msg);
      return;
    }

    const messages = {
      itemAdminId: 'soDetail.itemAdminId',
      itemId: 'soDetail.itemId',
      expectQty1: 'soDetail.expectQty1',
    };
    const columns = ['itemAdminId', 'itemId', 'expectQty1'];    // required 컬럼 dataField 정의
    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {
      try {
        let result;
        const saveContent = this.popupData as SearchVO;
        const detailList = this.collectGridData(this.changes);

        // return;
        for (const detail of detailList) {
          if (detail.expectQty1 <= 0) {
            // '입고예정수량을 1개 이상 입력하세요.'
            const msg = this.utilService.convert1('gt_expectQty', '입고예정수량을 1개 이상 입력하세요.');
            this.utilService.notify_error(msg);
            return;
          }
        }

        for (const item of detailList) {
          if (!item.key && !item.uid) {
            for (const col of columns) {
              if ((item[col] === undefined) || (item[col] === '')) {
                this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert(messages[col])));
                return;
              }
            }
          }

          this.popupGrid.instance.byKey(item.key).then(
            (dataItem) => {
              for (const col of columns) {
                if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
                  this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert(messages[col])));
                  return;
                }
              }
            }
          );
        }


        saveContent.soDetailList = detailList;

        if (this.popupMode === 'Add') {
          result = await this.service.save(saveContent);
        } else {
          result = await this.service.update(saveContent);
        }
        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  collectGridData(changes: any): any[] {
    const gridList = [];
    for (const rowIndex in changes) {
      // Insert일 경우 UUID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: this.G_TENANT
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  onInitNewRow(e): void {
    // e.data.itemAdminId = this.dsItemAdmin.length > 0 ? this.dsItemAdmin[0].uid : null;
    e.data.itemAdminId = this.utilService.getCommonItemAdminId();
    e.data.expectQty1 = 0;
    e.data.tenant = this.utilService.getTenant();
    e.data.expectQty1 = 0;
    e.data.allocQty1 = 0;
    e.data.pickedQty1 = 0;
    e.data.shippedQty1 = 0;
    e.data.adjustQty1 = 0;
    e.data.lotReserveFlg = 'N';
    e.data.damageFlg = 'N';
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    // 입고상태가 예정이 아닐 경우 return
    if (this.popupData.sts !== '100') {
      return;
    }

    if (this.popupGrid.focusedRowIndex > -1) {
      const focusedIdx = this.popupGrid.focusedRowIndex;

      this.popupGrid.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  setItemAdminValue(rowData: any, value: any): void {
    rowData.itemAdminId = value;
    rowData.itemId = null;
  }

  getFilteredItemId(options): any {
    // const filterSoType = this.dsSoType.filter(el => el.code === this.popupData.soType);
    let filter = [];
    if (this.popupData.soType !== 'PURRTN') {

      filter = this.dsItemId.filter(data => data.itemTypecd !== '01');

    } else {
      filter = this.dsItemId.filter(data => data.itemTypecd === '01');

    }
    return {
      store: filter
    };
  }

  setIsSerial(row: any, value: any): void {
    row.itemId = value;
    row.unit = value;
    row.isSerial = this.dsItemId.filter(el => el.uid === value)[0].isSerial;
  }

  onChangedCountry(e): void {
    this.dsPort = this.dsAllPort.filter(data => data.etcColumn1 === e.value);
  }

  onChangedCompany(e): void {
    const filtered = this.dsCompany.filter(el => el.uid === e.value);
    if (filtered.length > 0) {
      const data = filtered[0];
      this.popupForm.instance.getEditor('shipToId').option('value', data.shipToId);
      this.popupForm.instance.getEditor('countrycd').option('value', data.countrycd);
      this.popupForm.instance.getEditor('port').option('value', data.port);
      this.popupForm.formData.countrycd = data.countrycd;
      this.popupForm.formData.port = data.port;
      this.popupForm.formData.zip = data.zip;
      this.popupForm.formData.address1 = data.address1;
      this.popupForm.formData.refName = data.refName;
      this.popupForm.formData.address2 = data.address2;
      this.popupForm.formData.phone = data.phone1;
      this.popupForm.formData.email = data.email;

    }

  }
}
