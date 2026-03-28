import fs from 'fs';
import path from 'path';
import os from 'os';
import readJson from '../read-json';
import { ERROR_CODES, ERROR_NAMES } from '../const';
import { expect } from "vitest";


describe( 'readJson (unit)', () => {
  let dir: string;
  const file = 'config.json';


  const fullPath = () => path.join( dir, file );


  beforeEach( () => {
    dir = fs.mkdtempSync( path.join( os.tmpdir(), 'test-' ) );
  } );


  afterEach( () => {
    fs.rmSync( dir, { recursive: true, force: true } );
  } );


  const run = ( content: string, isCritical = false ) => {
    const errors = [];
    const warnings = [];

    if ( content !== null ) {
      fs.writeFileSync( fullPath(), content );
    }

    const data = readJson( fullPath(), file, { isCritical, errors, warnings } );

    return { data, errors, warnings };
  };


  it( 'returns null when user file path is missing', () => {
    const data = readJson( null, file, {errors:[],warnings: []});
    expect( data ).toBeNull();
  } );


  it( 'returns data when user file is valid JSON', () => {
    const { data } = run( '{"a":1}' );
    expect( data ).toEqual( { a: 1 } );
  } );


  it( 'returns warning when user file not found', () => {
    const { warnings } = run( null );
    const warning = warnings.find( w => w.name === ERROR_NAMES.FileNotFoundError );
    expect( warning ).toBeDefined();
    expect( warning.meta.code ).toBe( ERROR_CODES.USER_NOT_FOUND );
  } );


  it( 'returns warning when user file is empty', () => {
    const { warnings } = run( '' );
    const warning = warnings.find( w => w.name === ERROR_NAMES.EmptyFileError );
    expect( warning ).toBeDefined();
    expect( warning.meta.code ).toBe( ERROR_CODES.EMPTY_USER_FILE );
  } );


  it( 'returns warning when user file is empty object', () => {
    const { warnings } = run( '{}' );
    const warning = warnings.find( w => w.name === ERROR_NAMES.EmptyObjectError );
    expect( warning ).toBeDefined();
    expect( warning.meta.code ).toBe( ERROR_CODES.EMPTY_USER_OBJECT );
  } );


  it( 'returns error when user file is invalid JSON', () => {
    const { errors } = run( '{bad json}' );
    const error = errors.find( w => w.name === ERROR_NAMES.JsonParseError );
    expect( error ).toBeDefined();
    expect( error.meta.code ).toBe( ERROR_CODES.INVALID_JSON );
  } );


  it( 'pushes to errors when critical', () => {
    const { errors } = run( '', true );
    const error = errors.find( w => w.name === ERROR_NAMES.EmptyFileError );
    expect( error ).toBeDefined();
    expect( error.meta.code ).toBe( ERROR_CODES.EMPTY_DEFAULT_FILE );
  } );


} );
