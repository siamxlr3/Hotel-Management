<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // This resource receives the raw associative array from the service
        // We ensure the success/data structure is consistent.
        return $this->resource;
    }
}
