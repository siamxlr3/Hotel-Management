<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Models\Room;
use App\Models\RoomCategory;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomCategoryController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\TaxController;
use App\Http\Controllers\Api\GlobalDiscountController;
use App\Http\Controllers\Api\CategoryDiscountController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\HomeAboutController;
use App\Http\Controllers\Api\HomeFeatureController;
use App\Http\Controllers\Api\HomeOfferController;
use App\Http\Controllers\Api\HomeGalleryImageController;
use App\Http\Controllers\Api\HomeContactController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\LeaveTypeController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\ReportController;

// Public
Route::middleware('throttle:auth')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',  function (Request $req) { return $req->user(); });
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Diagnostic route
Route::get('/debug-db', function () {
    $host = env('DB_HOST', 'not set');
    return response()->json([
        'db_host' => $host,
        'resolved_ip' => gethostbyname($host),
        'server_ip' => $_SERVER['SERVER_ADDR'] ?? 'unknown',
        'filesystem' => env('FILESYSTEM_DISK', 'not set'),
        'php_version' => PHP_VERSION,
    ]);
});

Route::middleware('api')->group(function () {
    Route::apiResource('cms/home',           HomeController::class);
    Route::apiResource('cms/home-about',     HomeAboutController::class);
    Route::apiResource('cms/home-features',  HomeFeatureController::class);
    Route::apiResource('cms/home-offers',    HomeOfferController::class);
    Route::apiResource('cms/home-gallery',   HomeGalleryImageController::class);
    Route::apiResource('cms/home-contact',   HomeContactController::class);

    // Room Categories
    Route::apiResource('room-categories', RoomCategoryController::class);

    // Rooms
    Route::put('rooms/{room}/status', [RoomController::class, 'updateStatus']);
    Route::apiResource('rooms', RoomController::class);

    // Dropdown endpoint
    Route::get('room-categories-all', function () {
        $categories = RoomCategory::where('status', 'Active')
            ->select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();
        return response()->json(['success' => true, 'data' => $categories]);
    });

    // Taxes
    Route::apiResource('taxes', TaxController::class);

    // Global Discounts
    Route::apiResource('global-discounts', GlobalDiscountController::class);

    // Category Discounts
    Route::apiResource('category-discounts', CategoryDiscountController::class);

    // Helper dropdowns
    Route::get('rooms-dropdown', function () {
        return response()->json([
            'success' => true,
            'data'    => Room::select('id', 'room_number', 'category_id')
                ->where('status', 'Available')
                ->orderBy('room_number')
                ->get(),
        ]);
    });

    Route::get('categories-dropdown', function () {
        return response()->json([
            'success' => true,
            'data'    => RoomCategory::select('id', 'name')->where('status', 'Active')->orderBy('name')->get(),
        ]);
    });

    Route::get('expenses/summary',    [ExpenseController::class, 'summary']);
    Route::get('expenses/hotel-info', [ExpenseController::class, 'hotelInfo']);
    Route::apiResource('expenses',    ExpenseController::class);

    // Reservations
    Route::post('reservations/{id}/cancel', [ReservationController::class, 'cancelReservation']);
    Route::get('reservations/{reservation}/invoice', [ReservationController::class, 'downloadInvoice']);
    Route::get('reservations/checkouts', [ReservationController::class, 'checkouts']);
    Route::get('reservations/active/{roomId}', [ReservationController::class, 'getActiveReservation']);
    Route::apiResource('reservations', ReservationController::class);

    // Staff Management
    Route::apiResource('shifts',            ShiftController::class);
    Route::apiResource('roles',             RoleController::class);
    Route::apiResource('staff',             StaffController::class);
    Route::apiResource('attendances',       AttendanceController::class);
    Route::apiResource('leave-types',       LeaveTypeController::class);
    Route::apiResource('leaves',            LeaveController::class);
    Route::get('payrolls/summary',          [PayrollController::class, 'summary']);
    Route::apiResource('payrolls',          PayrollController::class);

    // Reports
    Route::get('reports', [ReportController::class, 'index'])->middleware('throttle:reports');
});
