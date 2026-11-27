export const homeFor = (user) => user?.role === 'admin' ? '/admin/courses' : '/instructor/lectures';
export const errorText = (error) => error.response?.data?.message || 'We could not reach the server. Please try again.';
export function addDate(key, amount) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}
