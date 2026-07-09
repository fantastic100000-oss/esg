import { calculateEmissions } from './calculations';
import type { EsgRecord } from '../types';

export interface GriRow {
  code: string;
  title: string;
  value: string;
  sourceFields: string;
}

/** 입력된 ESG 데이터를 GRI 공시 항목에 매핑한다. */
export function buildGriMapping(records: EsgRecord[]): GriRow[] {
  const totals = records.reduce(
    (acc, r) => {
      const emissions = calculateEmissions(r);
      return {
        electricityKwh: acc.electricityKwh + r.electricityKwh,
        cityGasM3: acc.cityGasM3 + r.cityGasM3,
        vehicleFuelL: acc.vehicleFuelL + r.vehicleFuelL,
        waterM3: acc.waterM3 + r.waterM3,
        wasteKg: acc.wasteKg + r.wasteKg,
        scope1: acc.scope1 + emissions.scope1TCo2e,
        scope2: acc.scope2 + emissions.scope2TCo2e,
      };
    },
    {
      electricityKwh: 0,
      cityGasM3: 0,
      vehicleFuelL: 0,
      waterM3: 0,
      wasteKg: 0,
      scope1: 0,
      scope2: 0,
    },
  );

  return [
    {
      code: 'GRI 302-1',
      title: '에너지 사용량',
      value: `전력 ${totals.electricityKwh.toLocaleString()} kWh · 도시가스 ${totals.cityGasM3.toLocaleString()} m³ · 차량연료 ${totals.vehicleFuelL.toLocaleString()} L`,
      sourceFields: '전력 사용량, 도시가스 사용량, 차량연료 사용량',
    },
    {
      code: 'GRI 303-3',
      title: '용수 취수량',
      value: `${totals.waterM3.toLocaleString()} m³`,
      sourceFields: '용수 사용량',
    },
    {
      code: 'GRI 305-1',
      title: 'Scope 1 배출량',
      value: `${totals.scope1.toFixed(2)} tCO2e`,
      sourceFields: '도시가스 사용량, 차량연료 사용량 (자동 계산)',
    },
    {
      code: 'GRI 305-2',
      title: 'Scope 2 배출량',
      value: `${totals.scope2.toFixed(2)} tCO2e`,
      sourceFields: '전력 사용량 (자동 계산)',
    },
    {
      code: 'GRI 306-3',
      title: '폐기물 발생량',
      value: `${totals.wasteKg.toLocaleString()} kg`,
      sourceFields: '폐기물 발생량',
    },
  ];
}
