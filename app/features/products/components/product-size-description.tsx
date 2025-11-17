import { productSize1 } from "~/assets/images";
import Divider from "~/common/components/divider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";

export default function ProductSizeDescription() {
  return (
    <div className="flex flex-col items-start gap-2.5 self-stretch">
      <div className="flex flex-col justify-center items-center self-stretch">
        <img src={productSize1} />
        <span className="text-center text-xs leading-[100%] tracking-[-0.4px] text-muted-foreground">
          디자인, 소재, 측정 방법에 따라 오차가 있을 수 있습니다.
        </span>
      </div>
      <div className="flex w-full px-4 justify-center items-center">
        <Table>
          <TableHeader>
            <TableRow className="flex px-2 py-2 gap-9 bg-muted/10">
              <TableHead className="w-12 h-5.5 text-center flex items-center">
                사이즈
              </TableHead>
              <TableHead className="w-12 h-5.5 text-center flex items-center">
                12M
              </TableHead>
              <TableHead className="w-12 h-5.5 text-center flex items-center">
                24M
              </TableHead>
              <TableHead className="w-12 h-5.5 text-center flex items-center">
                36M
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="flex px-2 py-2 gap-9">
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                총기장
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                54
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                84
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                104
              </TableCell>
            </TableRow>
            <TableRow className="flex px-2 py-2 gap-9">
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                어깨단면
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                38
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                40
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                42
              </TableCell>
            </TableRow>
            <TableRow className="flex px-2 py-2 gap-9">
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                가슴단면
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                48.5
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                56.5
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                62.5
              </TableCell>
            </TableRow>
            <TableRow className="flex px-2 py-2 gap-9">
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                소매단면
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                15
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                30
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                45
              </TableCell>
            </TableRow>
            <TableRow className="flex px-2 py-2 gap-9">
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                소매길이
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                20
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                30
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                40
              </TableCell>
            </TableRow>
            <TableRow className="flex px-2 py-2 gap-9">
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                밑단단면
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                8
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                15
              </TableCell>
              <TableCell className="flex w-12 h-5.5 items-center justify-center">
                22
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
