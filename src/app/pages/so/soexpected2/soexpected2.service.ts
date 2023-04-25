import { Injectable } from '@angular/core';
import { APPCONSTANTS } from '../../../shared/constants/appconstants';
import { JHttpService } from '../../../shared/services/jhttp.service';
import { ApiResult } from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class SoServSoexpected2Serviceice {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/so/`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<searchVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<searchVO[]>>(baseUrl, searchData).toPromise();
      return result;
    } catch {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }

  async getPopup(data: {}): Promise<ApiResult<searchVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSoFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<searchVO>>(baseUrl, data).toPromise();
      return result;
    } catch {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }

  async save(data: {}): Promise<ApiResult<searchVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveSo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<searchVO[]>>(baseUrl, data).toPromise();
      return result;
    } catch {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }

  async update(data: {}): Promise<ApiResult<searchVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updateSo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<searchVO[]>>(baseUrl, data).toPromise();
      return result;
    } catch {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }

  async delete(data: searchVO): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteSo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
      return result;
    } catch {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }
}
export interface searchVO {
  tenant: string;
  sts: string;
  warehouseId: number;
  ownerId: number;
  fromShipSchDate: string;
  toShipSchDate: string;
  shipToId: number;
  companyId: number;
  soType: string;
  soKey: string;
  logisticsId: number;
  shipSchDate: string;
  deliveryType: string;
  remarks: string;
  refName: string;
  actFlg: string;
  email: string;
  phone: string;
  countrycd: string;
  port: string;
  zip: string;
  address1: string;
  address2: string;
  soDetailList: SoDetailVO[];
  createdBy: number;
}
export interface DetailVO {
  uid: number;
}
export interface SoDetailVO {
  uid: number;
  tenant: string;
  operType: string;
  itemAdminId: number;
  itemId: number;
  expectQty1: number;
  receivedQty1: number;
  adjustQty1: number;
  lot1: string;
  lot2: string;
  lot3: string;
  lot4: string;
  lot5: string;
  lot6: string;
  lot7: string;
  lot8: string;
  lot9: string;
  lot10: string;
  damageFlg: string;
  noShippingFlg: string;
  foreignCargoFlg: string;
  customsReleaseFlg: string;
  taxFlg: string;
  whInDate: string;
  mngDate: string;

}

