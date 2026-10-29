
/**
 * 생년월일 기준 만 나이 계산
 * birthDate: "2009-05-20" 형식
 */
export function calculateAge(birthDate, today = new Date()) {
    if (!birthDate) return null;

    const match = String(birthDate)
        .match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const birth = new Date(year, month - 1, day);

    if (
        birth.getFullYear() !== year ||
        birth.getMonth() !== month - 1 ||
        birth.getDate() !== day ||
        birth > today
    ) {
        return null;
    }

    let age = today.getFullYear() - year;

    if (
        today.getMonth() + 1 < month ||
        (today.getMonth() + 1 === month &&
            today.getDate() < day)
    ) {
        age--;
    }

    return age;
}

export function isMinor(birthDate) {
    const age = calculateAge(birthDate);
    return age !== null && age < 19;
}
