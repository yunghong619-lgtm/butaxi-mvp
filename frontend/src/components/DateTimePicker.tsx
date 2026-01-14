import { useState } from 'react';

interface DateTimePickerProps {
  label: string;
  value: string; // ISO datetime string
  onChange: (value: string) => void;
  minDate?: string;
}

export default function DateTimePicker({ label, value, onChange, minDate }: DateTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  // value를 날짜와 시간으로 분리
  const parseValue = (isoString: string) => {
    if (!isoString) {
      const now = new Date();
      return {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
      };
    }
    const [date, time] = isoString.split('T');
    return {
      date,
      time: time?.slice(0, 5) || '09:00',
    };
  };

  const { date: currentDate, time: currentTime } = parseValue(value);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedTime, setSelectedTime] = useState(currentTime);

  // 날짜와 시간을 합쳐서 ISO 문자열로 변환
  const combineDateTime = (date: string, time: string) => {
    return `${date}T${time}`;
  };

  const handleConfirm = () => {
    const combined = combineDateTime(selectedDate, selectedTime);
    onChange(combined);
    setShowPicker(false);
  };

  const formatDisplayValue = (isoString: string) => {
    if (!isoString) return '날짜와 시간을 선택하세요';
    
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };

  // 시간 옵션 생성 (30분 간격)
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        options.push(`${hour}:${minute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // 일반 시간 옵션 (주요 시간대만)
  const quickTimeOptions = [
    { label: '오전 7시', value: '07:00' },
    { label: '오전 8시', value: '08:00' },
    { label: '오전 9시', value: '09:00' },
    { label: '오전 10시', value: '10:00' },
    { label: '오후 5시', value: '17:00' },
    { label: '오후 6시', value: '18:00' },
    { label: '오후 7시', value: '19:00' },
    { label: '오후 8시', value: '20:00' },
  ];

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {label}
      </label>

      {/* 선택된 값 표시 버튼 */}
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-all shadow-sm hover:shadow-md text-left flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {formatDisplayValue(value)}
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* 모달 */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md md:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-lg font-bold text-gray-900">{label}</h3>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 날짜 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">날짜</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={minDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 빠른 시간 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">빠른 선택</label>
                <div className="grid grid-cols-4 gap-2">
                  {quickTimeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedTime(option.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                        selectedTime === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 상세 시간 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">상세 시간</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* 미리보기 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">선택한 시간</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatDisplayValue(combineDateTime(selectedDate, selectedTime))}
                </p>
              </div>
            </div>

            {/* 버튼 */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
