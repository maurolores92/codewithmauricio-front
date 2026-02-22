import { DataGrid, esES } from "@mui/x-data-grid";

const FullTable = ({
  data,
  columns,
  paginationModel,
  rowSelected,
  setRowSelected,
  setPagination,
  checkboxSelection = true,
  py = 0,
  onRowClick,
  hideFooter = false,
}: any) => {

  return  <DataGrid
  autoHeight
  localeText={esES.components.MuiDataGrid.defaultProps.localeText}
  rows={paginationModel ? data.data: data}
  getRowHeight={() => 'auto'}
  rowCount={paginationModel ? data.count: undefined}
  columns={columns}
  checkboxSelection = {checkboxSelection}
  disableRowSelectionOnClick
  paginationMode='server'
  paginationModel={paginationModel}
  pageSizeOptions={[7, 10, 25, 50]}
  onPaginationModelChange={setPagination}
  rowSelectionModel={rowSelected}
  onRowSelectionModelChange={(newRowSelectionModel) => {
    setRowSelected(newRowSelectionModel);
  }}
  onRowClick={onRowClick}
  hideFooter={hideFooter}
  columnHeaderHeight={30}
  sx={{
    [`& .MuiDataGrid-row`]: {height: '40px'},
    [`& .MuiDataGrid-cell`]: {
      py,
      lineHeight: 'unset !important',
      maxHeight: 'none !important',
      whiteSpace: 'normal',
    },
  }}
  />
};

export default FullTable;
