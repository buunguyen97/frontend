import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {RcvService, SearchVO} from './rcv.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent, DxPopupComponent} from 'devextreme-angular';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvCommonUtils} from '../rcvCommonUtils';
import DataSource from 'devextreme/data/data_source';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import ArrayStore from 'devextreme/data/array_store';


@Component({
  selector: 'app-rcv',
  templateUrl: './rcv.component.html',
  styleUrls: ['./rcv.component.scss']
})

export class RcvComponent implements OnInit, AfterViewInit {
  mainFormData: SearchVO = {} as SearchVO;
  G_TENANT: any;
  dsRcvStatus = [];
  dsRcvType = [];
  dsSupplier = [];
  dsWarehouse = [];
  dsOwner = [];
  dsActFlg = []; // 사용여부
  dsCountry = []; // 국가
  dsPort = []; // 국가
  entityStore: ArrayStore;
  mainDataSource: DataSource;
  popupDataSource: DataSource;
  popupData: SearchVO;
  dataSource: DataSource;
  key = 'uid';
  selectedRows: number[];
  deleteRowList = [];
  changes = [];
  dsDamageFlg = []; // 불량여부
  copyPort = []; // 전체 항구
  dsAllSupplier = [];
  dsItemAdmin = []; // 품목관리사
  dsItemId = []; // 품목
  dsUser = []; // 사용자
  dsUnitStyle = []; // 단위유형
  dsFilteredItemId = [];
  popupVisible = false;
  popupEntityStore: ArrayStore;
  popupMode = 'Add';
  searchList = [];
  thien = [];

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;
  @ViewChild('fromReceiveDate', {static: false}) fromReceiveDate: DxDateBoxComponent;
  @ViewChild('toReceiveDate', {static: false}) toReceiveDate: DxDateBoxComponent;


  GRID_STATE_KEY = 'rcv_rcv';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  supplierChangedFlg = true;  // 공급처 선택이벤트 활성화 여부
  portChangedFlg = true;

  constructor(public utilService: CommonUtilService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private service: RcvService,
  ) {
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.onSelectionChangedWarehouse = this.onSelectionChangedWarehouse.bind(this);
    this.onChangeSupplier = this.onChangeSupplier.bind(this);
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.setItemValue = this.setItemValue.bind(this);
    this.onSelectionChangedCountry = this.onSelectionChangedCountry.bind(this);
    this.isAllowEditing = this.isAllowEditing.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
    // this.popupShowing = this.popupShowing.bind(this);
  }

  ngAfterViewInit(): void {
    this.popupEntityStore = new ArrayStore(
      {
        data: [], key: this.key
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initForm(): void {
     // 공통 조회 조건 set
     const rangeDate = this.utilService.getDateRange();

     this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
     this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
     this.mainForm.instance.getEditor('sts').option('value', RcvCommonUtils.STS_IDLE); // 예정
     this.fromRcvSchDate.value = rangeDate.fromDate;
     this.toRcvSchDate.value = rangeDate.toDate;
     this.fromReceiveDate.value = '';
     this.toReceiveDate.value = '';

     // this.mainForm.instance.getEditor('fromRcvSchDate').option('value', fromDate);
     // this.mainForm.instance.getEditor('toRcvSchDate').option('value', rangeDate.toDate);
     this.mainForm.instance.focus();

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
    this.codeService.getCompany(this.G_TENANT, null, true, true, true, null, null, null).subscribe(result => {
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
        // 전체 품목
        this.codeService.getItem(this.G_TENANT).subscribe(result => {
          this.dsItemId = result.data;
          this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
        });
    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });
    this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });
    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
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

  async onChangeSupplier(e): Promise<void> {
    const filtered = this.dsSupplier.filter(el => el.uid === e.value);
    if (filtered.length > 0 && this.supplierChangedFlg) {
      const data = filtered[0];
      this.popupForm.instance.getEditor('refName').option('value', data.refName);
      this.popupForm.instance.getEditor('supplierPhone').option('value', data.phone1);
      this.popupForm.instance.getEditor('supplierCountrycd').option('value', data.countrycd);
      this.popupForm.instance.getEditor('supplierPortcd').option('value', '');
      this.popupForm.instance.getEditor('supplierZip').option('value', data.zip);
      this.popupForm.instance.getEditor('supplierAddress1').option('value', data.address1);
      this.popupForm.instance.getEditor('supplierAddress2').option('value', data.address2);
    }
  }

  isAllowEditing(): boolean {
    return this.popupData.sts === RcvCommonUtils.STS_IDLE && this.popupData.moveId == null;
  }

  setItemValue(rowData: any, value: any): void {
    alert(1)
    rowData.itemId = value;
    rowData.isSerial = this.dsItemId.filter(el => el.uid === value)[0].isSerial;          // 시리얼여부
    rowData.unit = value;
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  onSelectionChangedCountry(e): void {
    this.dsPort = this.copyPort.filter(el => el.etcColumn1 === (e ? e.value : this.popupData.supplierCountrycd));
    if (this.portChangedFlg) {
      this.popupData.supplierPortcd = null; // 국가 선택시 항구 초기화
    }
  }

  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  getFilteredItemId(options): any {
    const filtredRcvType = this.dsRcvType.filter(el => el.code === this.popupData.rcvTypecd);

    const filter = [];
    filter.push(['itemAdminId', '=', this.utilService.getCommonItemAdminId()]);


    if (filtredRcvType.length > 0) {
      filter.push('and');
      const etcColumn1 = filtredRcvType[0].etcColumn1;
      const typeArr = (etcColumn1 || '').split(',');

      const innerCond = [];
      // tslint:disable-next-line:forin
      for (const idx in typeArr) {
        const type = typeArr[idx].trim();
        innerCond.push(['itemTypecd', '=', type]);

        if (Number(idx) !== typeArr.length - 1) {
          innerCond.push('or');
        }
      }

      filter.push(innerCond);
    }

    return {
      store: this.dsItemId,
      filter: options.data ? filter : null
    };
  }

  // tslint:disable-next-line:typedef
  async onReset(): Promise<void>  {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    this.codeService.getCompany(this.G_TENANT, null, true, true, true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    if (data.isValid) {

      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.fromReceiveDate = document.getElementsByName('fromReceiveDate').item(1).getAttribute('value');
      this.mainFormData.toReceiveDate = document.getElementsByName('toReceiveDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;

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

  popupShown(e): void {
    this.onSelectionChangedCountry(null); // 조회시 필터 초기화

    this.deleteBtn.visible = this.popupMode === 'Edit'; // 삭제버튼
    this.popupForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());

    // không hiêủ

    if (this.popupData.rcvTypecd === 'RETUN') {
      // 주문반품일 경우 거래처
      this.codeService.getCompany(this.G_TENANT, null, true, true, null, null, null, null).subscribe(result => {
        this.dsSupplier = result.data;
      });
    } else {
      // 거래처
      this.codeService.getCompany(this.G_TENANT, null, null, null, true, null, null, null).subscribe(result => {
        this.dsSupplier = result.data;
      });
    }

    if (this.popupMode === 'Add') { // 신규
      this.popupForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
      this.popupForm.instance.getEditor('rcvSchDate').option('value', this.gridUtil.getToday());
      this.popupForm.instance.getEditor('sts').option('value', RcvCommonUtils.STS_IDLE);
      this.popupForm.instance.getEditor('rcvTypecd').option('value', RcvCommonUtils.TYPE_STD);
      this.popupForm.instance.getEditor('actFlg').option('value', RcvCommonUtils.FLAG_TRUE);
      this.popupData.companyId = Number(this.utilService.getCompanyId());


    } else if (this.popupMode === 'Edit') { // 수정

    }

    const disabledCond = this.popupForm.instance.getEditor('sts').option('value') !== RcvCommonUtils.STS_IDLE || this.popupData.moveId != null;
    // không có hiểu
    this.deleteBtn.visible = !disabledCond && this.popupMode === 'Edit';
    this.saveBtn.visible = !disabledCond;
    this.popupForm.instance.getEditor('supplierId').option('disabled', disabledCond);         // 예정일
    this.popupForm.instance.getEditor('actFlg').option('disabled', disabledCond);             // 사용여부
    this.popupForm.instance.getEditor('rcvTypecd').option('disabled', disabledCond);          // 입고타입
    this.popupForm.instance.getEditor('rcvSchDate').option('disabled', disabledCond);         // 예정일

    this.popupForm.instance.getEditor('supplierId').option('disabled', disabledCond);         // 공급처
    this.popupForm.instance.getEditor('refName').option('disabled', disabledCond);            // 담당자
    this.popupForm.instance.getEditor('supplierPhone').option('disabled', disabledCond);      // 연락처
    this.popupForm.instance.getEditor('supplierCountrycd').option('disabled', disabledCond);  // 국가
    this.popupForm.instance.getEditor('supplierPortcd').option('disabled', disabledCond);     // 항구
    this.popupForm.instance.getEditor('supplierZip').option('disabled', disabledCond);        // 우편번호
    this.popupForm.instance.getEditor('supplierAddress1').option('disabled', disabledCond);   // 주소1
    this.popupForm.instance.getEditor('supplierAddress2').option('disabled', disabledCond);   // 주소2

    this.popupForm.instance.getEditor('rcvTypecd').focus();
    this.supplierChangedFlg = true;
    this.portChangedFlg = true;
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    // 팝업 그리드 사이즈 조정
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);

  }

  async popupDeleteClick(e): Promise<void> {
    //
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

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
    this.supplierChangedFlg = false;
    this.portChangedFlg = false;
    // // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }
  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
  }

  showPopup(popupMode, data): void {
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

  async onSearchPopup(): Promise<void> {
    if (this.popupData.uid) {
      // Service의 get 함수 생성
      const result = await this.service.getRcvFull(this.popupData);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.popupData.moveId = result.data.moveId;

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

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();

    // 재조회
    this.onSearch();
  }

  onSelectionChangedWarehouse(e): void {  // 창고코드
    const findValue = this.dsWarehouse.filter(code => code.uid === e.value);

    this.popupData.companyId = this.utilService.getCommonOwnerId();
    this.popupData.logisticsId = findValue.length > 0 ? findValue[0].logisticsId : null;
  }

  addClick(): void {
    // 입고상태가 예정이 아닐 경우 return
    if (this.popupData.sts !== RcvCommonUtils.STS_IDLE || this.popupData.moveId != null) {
      return;
    }
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
    });
  }

  onInitNewRow(e): void {
    // e.data.itemAdminId = this.dsItemAdmin.length > 0 ? this.dsItemAdmin[0].uid : null;
    e.data.itemAdminId = this.utilService.getCommonItemAdminId();
    e.data.damageFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.noShippingFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.foreignCargoFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.customsReleaseFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.taxFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.expectQty1 = 0;
    e.data.receivedQty1 = 0;
    e.data.adjustQty1 = 0;
    e.data.whInDate = this.gridUtil.getToday();
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    // 입고상태가 예정이 아닐 경우 return
    if (this.popupData.sts !== RcvCommonUtils.STS_IDLE || this.popupData.moveId != null) {
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

  focusIn(e: any): void {
    let len = 1;
    const textValue = e.component._textValue?.trimEnd();
    if (textValue && textValue.charAt(textValue.length - 1) !== ')') {
      len = textValue.length + 1;
    } else {
      len = e.component._value?.trimEnd().length + 1;
    }

    e.element.children[1].children[0].children[0].onclick = () => {
      if (e.element.children[1].children[0].children[0].selectionStart < textValue.length) {

      } else {
        e.element.children[1].children[0].children[0].selectionStart = len || 1;
        e.element.children[1].children[0].children[0].selectionEnd = len || 1;
      }
    };
  }
}
