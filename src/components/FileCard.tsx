import { FileText, Archive, File, Image, Download, ExternalLink } from "lucide-react"

interface FileCardProps {
    fileUrl: string
    fileType: string
}

function getFileConfig(type: string) {
    const t = type.toLowerCase()
    if (t === "pdf")
        return { Icon: FileText, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "PDF Document" }
    if (t === "zip" || t === "rar" || t === "gzip" || t === "gz")
        return { Icon: Archive, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", label: "Archive" }
    if (t === "doc" || t === "docx")
        return { Icon: File, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Word Document" }
    if (t === "ppt" || t === "pptx")
        return { Icon: File, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Presentation" }
    if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(t))
        return { Icon: Image, color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Image" }
    return { Icon: File, color: "text-slate-600", bg: "bg-slate-50 border-slate-200", label: "File" }
}

export default function FileCard({ fileUrl, fileType }: FileCardProps) {
    const { Icon, color, bg, label } = getFileConfig(fileType)
    const fileName = fileUrl.split("/").pop() || "Attached File"

    return (
        <div className={`inline-flex items-center gap-3 rounded-lg border px-4 py-3 ${bg}`}>
            <div className={`p-2 rounded-lg bg-white/70 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate max-w-48">{fileName}</p>
                <p className={`text-xs font-semibold uppercase ${color}`}>{label} &middot; .{fileType}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                <a
                    href={fileUrl}
                    download
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                    title="Download"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Download className="w-4 h-4" />
                </a>
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    title="Open in new tab"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    )
}
