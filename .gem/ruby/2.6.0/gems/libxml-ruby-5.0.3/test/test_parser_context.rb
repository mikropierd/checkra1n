# encoding: UTF-8

require_relative './test_helper'


class TestParserContext < Minitest::Test
  def test_string
    # UTF8
    xml = <<-EOS
      <bands>
        <metal>m\303\266tley_cr\303\274e</metal>
      </bands>
    EOS

    context = LibXML::XML::Parser::Context.string(xml)
    assert_instance_of(LibXML::XML::Parser::Context, context)
    assert_equal(LibXML::XML::Encoding::NONE, context.encoding)
    assert_nil(context.base_uri)
  end

  def test_encoding
    # ISO_8859_1:
    xml = <<-EOS
      <bands>
        <metal>m\366tley_cr\374e</metal>
      </bands>
    EOS

    context = LibXML::XML::Parser::Context.string(xml)
    assert_equal(LibXML::XML::Encoding::NONE, context.encoding)

    context.encoding = LibXML::XML::Encoding::ISO_8859_1
    assert_equal(LibXML::XML::Encoding::ISO_8859_1, context.encoding)
  end

  def test_invalid_encoding
    # UTF8
    xml = <<-EOS
      <bands>
        <metal>m\303\266tley_cr\303\274e</metal>
      </bands>
    EOS

    context = LibXML::XML::Parser::Context.string(xml)

    error = assert_raises(ArgumentError) do
      context.encoding = -999
    end
    assert_equal("Unknown encoding: -999", error.to_s)
  end

  def test_base_uri
    # UTF8
    xml = <<-EOS
      <bands>
        <metal>m\303\266tley_cr\303\274e</metal>
      </bands>
    EOS

    context = LibXML::XML::Parser::Context.string(xml)
    assert_nil(context.base_uri)

    context.base_uri = 'http://libxml.rubyforge.org'
    assert_equal('http://libxml.rubyforge.org', context.base_uri)
  end

  def test_string_empty
    error = assert_raises(TypeError) do
      LibXML::XML::Parser::Context.string(nil)
    end
    assert_equal("wrong argument type nil (expected String)", error.to_s)

    error = assert_raises(ArgumentError) do
      LibXML::XML::Parser::Context.string('')
    end
    assert_equal("Must specify a string with one or more characters", error.to_s)
  end

  def test_well_formed
    parser = LibXML::XML::Parser.string("<abc/>")
    parser.parse
    assert(parser.context.well_formed?)
  end

  def test_not_well_formed
    parser = LibXML::XML::Parser.string("<abc>")
    assert_raises(LibXML::XML::Error) do
      parser.parse
    end
    assert(!parser.context.well_formed?)
  end

  def test_version_info
    file = File.expand_path(File.join(File.dirname(__FILE__), 'model/bands.utf-8.xml'))
    parser = LibXML::XML::Parser.file(file)
    assert_nil(parser.context.version)
    parser.parse
    assert_equal("1.0", parser.context.version)
  end

  def test_depth
    context = LibXML::XML::Parser::Context.new
    assert_instance_of(Integer, context.depth)
  end

  def test_disable_sax
    context = LibXML::XML::Parser::Context.new
    assert(!context.disable_sax?)
  end

  def test_docbook
    context = LibXML::XML::Parser::Context.new
    assert(!context.docbook?)
  end

  def test_html
    context = LibXML::XML::Parser::Context.new
    assert(!context.html?)
  end

  def test_keep_blanks
    context = LibXML::XML::Parser::Context.new
    if context.keep_blanks?
      assert_instance_of(TrueClass, context.keep_blanks?)
    else
      assert_instance_of(FalseClass, context.keep_blanks?)
    end
  end

  def test_replace_entities
    context = LibXML::XML::Parser::Context.new
    assert(!context.replace_entities?)

    context.options = LibXML::XML::Parser::Options::NOENT
    assert(context.replace_entities?)

    context.options = 0
    assert(!context.replace_entities?)

    context.replace_entities = true
    assert(context.replace_entities?)
  end

  def test_space_depth
    context = LibXML::XML::Parser::Context.new
    assert_equal(1, context.space_depth)
  end

  def test_subset_external
    context = LibXML::XML::Parser::Context.new
    assert(!context.subset_external?)
  end

  def test_data_directory_get
    context = LibXML::XML::Parser::Context.new
    assert_nil(context.data_directory)
  end

  def test_parse_error
    xp = LibXML::XML::Parser.string('<foo><bar/></foz>')

    assert_raises(LibXML::XML::Error) do
      xp.parse
    end

    # Now check context
    context = xp.context
    assert_nil(context.data_directory)
    assert_equal(0, context.depth)
    assert_equal(true, context.disable_sax?)
    assert_equal(false, context.docbook?)
    assert_equal(LibXML::XML::Encoding::NONE, context.encoding)
    assert_equal(76, context.errno)
    assert_equal(false, context.html?)
    assert_equal(5, context.io_max_num_streams)
    assert_equal(1, context.io_num_streams)
    assert_equal(true, context.keep_blanks?)
    assert_equal(1, context.io_num_streams)
    assert_nil(context.name_node)
    assert_equal(0, context.name_depth)
    assert_equal(10, context.name_depth_max)
    assert([0, 17].include?(context.num_chars))
    assert_equal(false, context.replace_entities?)
    assert_equal(1, context.space_depth)
    assert_equal(10, context.space_depth_max)
    assert_equal(false, context.subset_external?)
    assert_nil(context.subset_external_system_id)
    assert_nil(context.subset_external_uri)
    assert_equal(false, context.subset_internal?)
    assert_nil(context.subset_internal_name)
    assert_equal(false, context.stats?)
    assert_equal(true, context.standalone?)
    assert_equal(false, context.valid)
    assert_equal(false, context.validate?)
    assert_equal('1.0', context.version)
    assert_equal(false, context.well_formed?)
  end
end
