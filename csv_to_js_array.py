import pandas as pd
import os

# --- 사용자 설정 부분 (이전과 동일) ---
EXCEL_FILE_PATH = "./행정구역별_위경도_좌표.xlsx" 
OUTPUT_JS_FILE = "locations_data.js"

COL_SIDO = '시도'
COL_SIGUNGU = '시군구'
COL_EUPMYEONDONG_GU = '읍면동/구'
COL_EUPMYEONRI_DONG = '읍/면/리/동'
COL_RI = '리'
COL_LAT = '위도'
COL_LON = '경도'
# --- 사용자 설정 끝 ---

def get_valid_address_part(row_series, col_name):
    """행에서 주소 부분을 가져오되, 유효하지 않은 값(NaN, "nan", 빈 문자열)은 빈 문자열로 반환"""
    val = row_series.get(col_name)
    if pd.isna(val): # pandas NaN 값 확인
        return ""
    
    str_val = str(val).strip()
    if str_val.lower() == 'nan' or str_val == '': # "nan" 문자열 또는 순수 빈 문자열 확인
        return ""
    return str_val

all_location_objects_str = []

print(f"스크립트 실행 위치 (현재 작업 디렉토리): {os.getcwd()}")
print(f"처리할 Excel 파일 경로: {os.path.abspath(EXCEL_FILE_PATH)}")

try:
    if not os.path.exists(EXCEL_FILE_PATH):
        raise FileNotFoundError(f"지정된 경로에 Excel 파일이 없습니다: {EXCEL_FILE_PATH}")

    xls = pd.ExcelFile(EXCEL_FILE_PATH)
    sheet_names = xls.sheet_names
    
    if not sheet_names:
        print(f"'{os.path.basename(EXCEL_FILE_PATH)}' 파일에 시트가 없습니다.")
    else:
        print(f"\n'{os.path.basename(EXCEL_FILE_PATH)}' 파일에서 다음 시트들을 찾았습니다: {sheet_names}")
        print(f"총 {len(sheet_names)}개의 시트를 처리합니다...")

    for sheet_name in sheet_names:
        print(f"  시트 처리 중: '{sheet_name}'")
        try:
            df = pd.read_excel(xls, sheet_name=sheet_name, dtype=str) # 모든 열을 문자열로 읽기
            
            if df.empty:
                print(f"    경고: '{sheet_name}' 시트가 비어 있습니다.")
                continue
            # print(f"    '{sheet_name}' 시트에서 {len(df)}개의 행을 발견했습니다.") # 필요시 주석 해제

            for index, row in df.iterrows():
                name_parts = []
                
                sido = get_valid_address_part(row, COL_SIDO)
                sigungu = get_valid_address_part(row, COL_SIGUNGU)
                eupmyeondong_gu = get_valid_address_part(row, COL_EUPMYEONDONG_GU)
                eupmyeonri_dong = get_valid_address_part(row, COL_EUPMYEONRI_DONG)
                ri = get_valid_address_part(row, COL_RI)

                if sido: name_parts.append(sido)
                elif sheet_name.strip() and sheet_name.strip().lower() != 'nan': # 시도 컬럼이 없을때 시트명 사용 (단, 시트명이 유효할때)
                    # print(f"      참고: '{sheet_name}' 시트의 행 {index+2}에서 '{COL_SIDO}' 컬럼 값이 없어 시트명을 사용합니다.")
                    name_parts.append(sheet_name.strip())


                if sigungu: name_parts.append(sigungu)
                
                temp_address_parts = []
                current_level_address = eupmyeondong_gu
                if eupmyeondong_gu:
                    temp_address_parts.append(eupmyeondong_gu)
                
                if eupmyeonri_dong and eupmyeonri_dong not in current_level_address:
                    temp_address_parts.append(eupmyeonri_dong)
                    current_level_address = eupmyeonri_dong 
                
                if ri and ri not in current_level_address:
                    temp_address_parts.append(ri)
                
                name_parts.extend(list(dict.fromkeys(temp_address_parts))) # 순서 유지, 중복 제거
                full_name = " ".join(filter(None, name_parts)).replace('  ', ' ').strip()


                lat_val = get_valid_address_part(row, COL_LAT) # 숫자도 이 함수로 처리 가능 (빈문자열 반환)
                lon_val = get_valid_address_part(row, COL_LON)

                if not lat_val or not lon_val: # 빈 문자열이면 건너뜀
                    # if full_name: print(f"      경고: '{full_name}'의 위도/경도 정보 부족. 건너뜀.")
                    continue
                
                try:
                    lat = float(lat_val)
                    lon = float(lon_val)
                except ValueError:
                    # if full_name: print(f"      경고: '{full_name}'의 위도/경도 숫자 변환 실패 ('{lat_val}', '{lon_val}'). 건너뜀.")
                    continue

                if full_name:
                    js_full_name = full_name.replace('"', '\\"')
                    location_obj_str = f'  {{ name: "{js_full_name}", lat: {lat:.6f}, lon: {lon:.6f} }}'
                    all_location_objects_str.append(location_obj_str)
        
        except Exception as e_sheet:
            print(f"    '{sheet_name}' 시트 처리 중 오류 발생: {e_sheet}")

except FileNotFoundError:
    print(f"\n오류: Excel 파일을 찾을 수 없습니다 - {EXCEL_FILE_PATH}")
    print(f"'{os.path.abspath(EXCEL_FILE_PATH)}' 경로에 파일이 있는지 확인해주세요.")
except Exception as e_file:
    print(f"\n'{EXCEL_FILE_PATH}' 파일 열기 또는 처리 중 알 수 없는 오류 발생: {e_file}")


if all_location_objects_str:
    output_js_content = "const locations = [\n"
    output_js_content += ",\n".join(all_location_objects_str)
    output_js_content += "\n];\n"
    try:
        with open(OUTPUT_JS_FILE, "w", encoding="utf-8") as f:
            f.write(output_js_content)
        print(f"\n성공! {OUTPUT_JS_FILE} 파일에 {len(all_location_objects_str)}개의 지역 정보를 저장했습니다.")
    except Exception as e_write:
        print(f"{OUTPUT_JS_FILE} 파일 저장 중 오류 발생: {e_write}")
else:
    if os.path.exists(EXCEL_FILE_PATH):
      print("\n처리된 지역 정보가 없습니다. Excel 파일 내 시트의 내용, 컬럼명('시도', '위도' 등)이 스크립트 설정과 일치하는지,")
      print("또는 위도/경도 데이터가 유효한지 확인해주세요.")
