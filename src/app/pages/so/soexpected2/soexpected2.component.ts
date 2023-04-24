import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Soexpected2Service, SearchVO} from '../../so/soexpected2/soexpected2.service';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent, DxPopupComponent} from 'devextreme-angular';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {SoCommonUtils} from '../../so/SoCommonUtils';

@Component({
  selector: 'app-soexpected2',
  templateUrl: './soexpected2.component.html',
  styleUrls: ['./soexpected2.component.scss']
})
export class Soexpected2Component implements OnInit, AfterViewInit {
  mainFormData: SearchVO = {} as SearchVO;
  G_TENANT: any;
  dsSoType = [];
  dsRcvStatus = [];
  dsCompany = [];
  dsShipTo = [];
  dsWarehouse = [];
  dsOwner = [];
  dsCountry = [];
  dsActFlg = [];
  dsSoStatus = [];
  dsDeliveryType = [];
  dsPort = [];
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


  GRID_STATE_KEY = 'rcv_rcv';
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
      this.dsRcvStatus = result.data;
      this.mainForm.instance.getEditor('sts').option('value', SoCommonUtils.STS_IDLE); // 예정
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
      console.log('dsWarehouse', this.dsWarehouse);
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

    this.popupData = data;
    this.popupData = {tenant: this.G_TENANT, ...this.popupData};
    this.popupMode = popupMode;
    this.popupVisible = true;
    this.onSearchPopup();
  }

  isAllowEditing(): boolean {
    // return this.popupData.sts === RcvCommonUtils.STS_IDLE;
    return true;
  }

  async onSearchPopup(): Promise<void> {
    if (this.popupData.uid) {
      // Service의 get 함수 생성
      const result = await this.service.getRcvFull(this.popupData);

      // console.log(result);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        // this.popupData.moveId = result.data.moveId;

        this.popupEntityStore = new ArrayStore(
          {
            data: result.data.rcvDetailList,
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
    if (this.popupData.sts !== SoCommonUtils.STS_IDLE) {
      return;
    }
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
      console.log(rowIdx);
      console.log(this.changes);
    });
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();

    // 재조회
    this.onSearch();
  }

  popupShown(e): void {

    // 입고 예정이 아닐경우 삭제 버튼 숨기기
    // if(this.popupData.sts !== '200') {
    //   this.deleteBtn.visible = false;
    // } else {
    //   this.deleteBtn.visible = false;
    // }

    if (this.popupMode === 'Add') {

      this.popupData.sts = SoCommonUtils.STS_IDLE;
      this.popupData.deliveryType = 'OUTER';
      this.popupData.shipSchDate  = this.utilService.getFormatDate(new Date());
      this.popupData.warehouseId = this.utilService.getCommonWarehouseId();
      this.popupData.ownerId = this.utilService.getCommonOwnerId();
      this.popupData.soType = 'RENT';
      this.popupData.actFlg = 'Y';

    } else {
      this.popupForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());

    }

    this.popupData.logisticsId = 1;
    this.popupData.companyId = 1;

    // mới thêm tăng chiều cao cho cacs item
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
    // this.supplierChangedFlg = false;
    // this.portChangedFlg = false;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('rcvTx', '입고전표'));
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

    console.log(this.changes);
    const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('rcvTx', '입고전표'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    // 상품목록 추가여부
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {
      // '입고상품 목록을 추가하세요.'
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert('rcvExpect_popupGridTitle'));
      this.utilService.notify_error(msg);
      return;
    }

    // 선택한 화주를 품목에 세팅
    const items = this.popupDataSource.items() || [];

    const ownerId = this.popupForm.instance.getEditor('ownerId').option('value');
    console.dir('ataa', this.popupForm.formData);

    for (const item of this.changes) {
      if (item.type !== 'remove') {
        item.data.ownerId = ownerId;
      }
    }

    for (const item of items) {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(item.uid);
      this.popupGrid.instance.cellValue(rowIdx, 'ownerId', ownerId);
    }

    const messages = {
      temAdminId: 'rcvDetail.itemAdminId',
      itemId: 'rcvDetail.itemId',
      expectQty1: 'rcvDetail.expectQty1',
      whInDate: 'rcvDetail.whInDate'
    };
    const columns = ['itemAdminId', 'itemId', 'expectQty1', 'whInDate'];    // required 컬럼 dataField 정의
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

        saveContent.rcvDetailList = detailList;

        if (this.popupMode === 'Add') {
          console.log('add', saveContent);
          result = await this.service.save(saveContent);
        } else {
          console.log('bbbb', saveContent);
          result = await this.service.update(saveContent);
        }
        if (!result.success) {
          alert(2);
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

  // Them hoac xoa dong
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
    console.log('gridList:', gridList);
    return gridList;
  }

  onInitNewRow(e): void {
    // e.data.itemAdminId = this.dsItemAdmin.length > 0 ? this.dsItemAdmin[0].uid : null;
    e.data.itemAdminId = 1;
    // e.data.damageFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.noShippingFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.foreignCargoFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.customsReleaseFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.taxFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.expectQty1 = 0;
    // e.data.receivedQty1 = 0;
    // e.data.adjustQty1 = 0;
    e.data.whInDate = this.gridUtil.getToday();
    console.log(e.data);
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    // 입고상태가 예정이 아닐 경우 return
    if (this.popupData.sts !== '200') {
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
  onChangedCompany(e): void {
     const companyData = [...this.dsCompany].filter(el => el.uid === e.value);
    if (companyData.length > 0) {

    }

  }

}
