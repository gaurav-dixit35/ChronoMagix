export async function save(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}
